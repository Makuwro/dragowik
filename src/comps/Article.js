import React from "react";
import "../styles/article.css";
import {withRouter, Redirect, Link} from "react-router-dom";
import parse, {domToReact} from "html-react-parser";
import Outline from "./Outline";

const RedirectRegex = /#REDIRECT \[\[(\w+)\]\]/g;
const ArticleNameRegex = /\/wiki\/article\/(\w+)/g;
const WikiMarkupRegex = /(# (?<h1>.+))|(## (?<h2>.+))|(### (?<h3>.+))|(?<element><(\w+?)( (?<elementAttribs>\w+=".+?|")|)>(?<elementText>.+?)<\/\w+?>)|(\[\[(?<aBracket>.+?)\]\])|(\*\*(?<bAsterisk>(.+))\*\*)|\n+?(?<newLine>[^#\n]+)/gm;

function isHeader(tag) {
  return typeof({"h1": true, "h2": true, "h3": true}[tag]) === "boolean";
};

function splice(str, start, end, replacement) {
  return str.substring(0, start) + replacement + str.substring(end, str.length + 1);
};

class Article extends React.Component {
  
  constructor(props) {
    super(props);
    this.nonExistentArticles = [];
    this.linksToCheck = [];
    
    var functionsToBind = [
      "vanishArticle", "checkArticleLinks", "fixSource", "generateMarkup",
      "selectText", "formatText", "openLinkFormatter", "formatLink",
      "changeHeading"
    ];
    
    for (var i = 0; functionsToBind.length > i; i++) {
      this[functionsToBind[i]] = this[functionsToBind[i]].bind(this);
    };
    
    var redirectArticleName;
    var source = this.props.redirect ? props.source : false;
    if (source) {
      var redirectArticle = [...source.matchAll(RedirectRegex)][0];
      redirectArticleName = redirectArticle ? redirectArticle[1] : undefined;
    };
    
    this.state = {
      redirectArticleName: redirectArticleName,
      content: "",
      nonExistentArticles: {}
    };
    
  };
  
  async componentDidMount() {
    if (this.props.source) {
      var markup = this.generateMarkup();
      await this.checkArticleLinks();
      this.setState({content: this.fixSource(markup)});
      if (this.props.location.hash !== "") {
        setTimeout(() => {
          var element = document.getElementById(this.props.location.hash.replace("#", ""));
          window.scrollTo({
            behavior: element ? "smooth" : "auto",
            top: element ? element.offsetTop : 0
          });
        }, 500);
      };
    };
    
    let articleDiv = document.getElementById("article-container");
    if (!this.state.redirectArticleName && articleDiv) { 
      setTimeout(() => articleDiv.classList.add("visible"), 300);
    };
  };
  
  fixSource(markup) {
    this.headerRefs = [];
    var content = parse(markup, {
      replace: (domNode) => {
        if (isHeader(domNode.name)) {
          return React.createElement(domNode.name, {
            ref: ref => {
              if (ref) { this.headerRefs.push(ref) };
              this.setState({headers: this.headerRefs})
            },
            id: domNode.attribs.id
          }, domToReact(domNode.children));
        } else if (domNode.children) {
          if (domNode.name === "a") {
            var articleLocation = domNode.attribs.href;
            var blueLink = !this.state.nonExistentArticles[articleLocation];
            return <a onClick={this.vanishArticle} href={articleLocation} title={!blueLink ? "This article doesn't exist! Why don't we change that?" : undefined} className={!blueLink ? "article-link-invalid" : undefined}>{domToReact(domNode.children)}</a>;
          };
          return domNode;
        };
      }
    });
    
    return content;
  };
  
  async componentDidUpdate(prevProps) {
    
    if (this.props.location.redirectedFrom && this.state.redirectArticleName) {
      this.setState({redirectArticleName: undefined});
    };
    
    if (!this.state.redirectArticleName) {
      
      if (this.props.source && prevProps.source !== this.props.source) {
        var markup = this.generateMarkup();
        await this.checkArticleLinks();
        this.setState({content: this.fixSource(markup)});
      };
      
      setTimeout(() => {
        let articleDiv = document.getElementById("article-container");
        if (articleDiv) {
          articleDiv.classList.add("visible");
        };
      }, 300);
    };
  };
  
  vanishArticle(event) {
    event.preventDefault();
    document.getElementById("article-container").classList.remove("visible");
    
    const {history} = this.props;
    setTimeout(() => history.push(event.target.getAttribute("href")), 300);
  };
  
  async checkArticleLinks() {
    // Make sure we got something to work with
    if (!this.props.source) return;
    
    for (var i = 0; this.linksToCheck.length > i; i++) {
      
      var possibleName = this.linksToCheck[i];
      
      console.log("Checking if " + possibleName + " exists...");
                      
      // Check the cache
      const ArticleLocation = "/wiki/article/" + possibleName;
      if (this.nonExistentArticles[ArticleLocation]) return false;
      
      // Check the server
      const ArticleNameArray = [...ArticleLocation.matchAll(ArticleNameRegex)][0];
      const ArticleName = ArticleNameArray ? ArticleNameArray[1] : undefined;
      
      if (!ArticleName) return false;
      
      // Now let's check with the server
      var articleExists = false;
      try {
        const Response = await fetch("/api/article/" + ArticleName);
        if (!Response.ok) {
          console.log(ArticleName + " doesn't exist");
        } else {
          articleExists = true;
        };
      } catch (err) {
        console.warn("Couldn't verify that " + ArticleName + " exists. Assuming it doesn't exist.");
      };
      
      if (!articleExists) {
        this.setState(state => {
          var nonExistentArticles = state.nonExistentArticles;
          nonExistentArticles[ArticleLocation] = true;
          return {nonExistentArticles: nonExistentArticles};
        });
      };
    };
  };
  
  generateMarkup() {
    
    const Matches = [...this.props.source.matchAll(WikiMarkupRegex)];
    var newSource = this.props.source;
    var headerIds = {};
    
    for (var i = 0; Matches.length > i; i++) {
      const Match = Object.keys(Matches[i].groups).filter((key) => {
        return Matches[i].groups[key];
      });
      
      switch (Match[0]) {
        
        case "h1":
        case "h2":
        case "h3":
        case "bAsterisk":
        case "newLine":
          var text = Matches[i].groups[Match[0]];
          
          // Make sure that the paragraph isn't a header
          if (Match[0] === "newLine") {
            const ChildMatches = [...text.matchAll(WikiMarkupRegex)];
            
            for (var x = 0; ChildMatches.length > x; x++) {
              const ChildMatch = Object.keys(ChildMatches[x].groups).filter((key) => {
                return ChildMatches[x].groups[key];
              });
              
              var childText = ChildMatches[x].groups[ChildMatch[0]];
              
              switch (ChildMatch[0]) {
                
                case "aBracket":
                case "bAsterisk":
                  const ElementName = ChildMatch[0] === "bAsterisk" ? "b" : (
                    ChildMatch[0] === "aBracket" ? "a" : undefined
                  );
                  
                  var spaceText;
                  if (ElementName === "a") {
                    this.linksToCheck.push(childText);
                    spaceText = childText.replace("_", " ");
                  };
                  
                  text = text.replace(ChildMatches[x][0], "<" + ElementName + (ElementName === "a" ? " class=\"article-bracket-link\"  href=\"/wiki/article/" + childText + "\"" : "") + ">" + (spaceText || childText) + "</" + ElementName + ">");
                  break;
                
                default:
                  break;
                
              };
            };
            
          };
          
          var possibleReplacement = isHeader(Match[0]) ? text.replaceAll(/[^a-zA-Z0-9 ]/g, "", "").replaceAll(" ", "_") : undefined;
          var headerId = possibleReplacement;
          if (possibleReplacement) {
            x = 0;
            while (!headerId) {
              if (x === 0 && !headerIds[headerId]) {
                break;
              };
              
              headerId = headerIds[possibleReplacement + "_" + x];
              
              if (headerIds[headerId]) {
                headerId = undefined;
                x++;
              };
            };
            headerIds[headerId] = true;
          };
          
          newSource = newSource.replace(
            Matches[i][0], 
            "<" + (Match[0] === "bAsterisk" ? "b" : 
            (Match[0] === "newLine" ? "p" : Match[0])) +
            (headerId ? " id=\"" + headerId + "\"" : "") +
            ">" + 
            text + 
            "</" + (Match[0] === "bAsterisk" ? "b" : 
            (Match[0] === "newLine" ? "p" : Match[0])) + ">");
          
          break;
        
        default:
          break;
        
      };
      
    };
  
    return newSource;
  };
  
  selectText() {
    
    let selection = window.getSelection();
    if (selection.type === "None") return;
    
    // Set the heading type
    let tagName = selection.anchorNode.parentElement.tagName.toLowerCase();
    let normalText = {
      "a": 1, "b": 1, "i": 1, "u": 1, "p": 1
    };
    document.getElementById("editor-formatter-heading").value = normalText[tagName] ? "p" : tagName;
    
    // Make sure it's a range
    if (
      selection.type !== "Range" || 
      document.getElementById("link-formatter").classList.contains("link-formatter-open")
    ) return;
    this.setState({selection: {
      getRangeAtZero: selection.getRangeAt(0),
      anchorNode: selection.anchorNode,
      str: selection.toString()
    }});
    
  };
  
  formatText(format) {
    
    // Make sure the format is valid + we got a selection
    let selection = this.state.selection;
    if (!{
      b: 1, i: 1, u: 1
    }[format] || !selection) return;
    
    // Get the range
    let textRange = selection.getRangeAtZero;
    let aNode = selection.anchorNode;
    let parentElement = aNode.parentElement;
    
    if (parentElement.tagName !== "P") {
      const GPElement = parentElement.parentElement;
      GPElement.replaceChild(
        document.createTextNode(parentElement.innerHTML), parentElement
      );
      GPElement.normalize();
      return;
    };
    
    parentElement.innerHTML = mergePrecedingHTML(aNode, parentElement.childNodes, splice(
      aNode.nodeValue, textRange.startOffset, 
      textRange.endOffset, "<" + format + ">" + selection.str + "</" + format + ">"
    ));
  };
  
  processingOpen = false;
  openLinkFormatter() {
    
    // Debounce
    let linkFormatterClasses = document.getElementById("link-formatter").classList;
    if (this.processingOpen || linkFormatterClasses.contains("link-formatter-open")) {
      console.warn("The link formatter is already open!");
      return;
    };
    this.processingOpen = true;
    console.log("Opening link formatter...");
    
    // Replace the text with the selection
    let selection = this.state.selection;
    if (selection) {
      document.getElementById("link-formatter-ui-text").value = selection.str;
    };
    
    // Let's open the GUI
    linkFormatterClasses.add("link-formatter-open");
    
    // Enough debouncing
    this.processingOpen = false;
    
  };
  
  formatLink(e) {
    e.preventDefault();
    
    // Replace the selected text
    let selection = this.state.selection;
    let aNode = selection.anchorNode;
    let parentElement = aNode.parentElement;
    if (selection) {
      
      // Get the range
      let textRange = selection.getRangeAtZero;
      let linkFormatterURL = document.getElementById("link-formatter-ui-url").value;
      
      if (parentElement.tagName !== "P") {
        
        // Create the link
        let anchor = document.createElement("a");
        anchor.setAttribute("href", linkFormatterURL);
        anchor.appendChild(
          document.createTextNode(parentElement.innerHTML)
        );
        
        // Replace the text
        const GPElement = parentElement.parentElement;
        GPElement.replaceChild(anchor, parentElement);
        GPElement.normalize();
        parentElement = GPElement;
      } else {
        parentElement.innerHTML = mergePrecedingHTML(aNode, parentElement.childNodes, splice(
          aNode.nodeValue, textRange.startOffset, 
          textRange.endOffset, "<a href=\"" + linkFormatterURL + "\">" + document.getElementById("link-formatter-ui-text").value + "</a>"
        ));
      };
      
    } else {
      
      // Create the text, but put it where the carat is
      
    };
    
    // Let's close the GUI
    document.getElementById("link-formatter").classList.remove("link-formatter-open");
    
  };
  
  changeHeading(e) {
    
    let selection = window.getSelection();
    let selectedANode = selection.anchorNode;
    if (selection.type === "None" || selectedANode === document.getElementById("article-content")) return;
    
    // Remove formatting
    let formatTags = {
      "B": 1, "A": 1, "I": 1, "U": 1
    };
    let parentElement = formatTags[selectedANode.parentElement.tagName] ? selectedANode.parentElement.parentElement : selectedANode.parentElement;
    
    // Create the heading
    let heading = document.createElement(e.target.value);
    heading.appendChild(
      document.createTextNode(parentElement.textContent)
    );
    
    // Replace the heading
    parentElement.parentElement.replaceChild(
      heading, parentElement
    );
    
    // Refocus the carat
    heading.focus();
    
  };
  
  render() {
    if (this.state.redirectArticleName && !this.props.location.redirectedFrom) {
      console.log("Redirecting from " + this.props.articleName + " to " + this.state.redirectArticleName);
      return <Redirect to={{
        pathname: "/wiki/article/" + this.state.redirectArticleName,
        redirectedFrom: this.props.articleName
      }} />
    } else {
      
      var timestamp;
      if (this.props.timestamp) {     
        var checkDate = new Date();
        var updateDate = new Date(this.props.timestamp);
        updateDate.setHours(updateDate.getHours() - (checkDate.getTimezoneOffset() / 60));
        var length = new Date() - updateDate;
        var seconds = Math.floor(length / 1000);
        if (seconds > 0) {
          var minutes = Math.floor(seconds / 60);
          var hours = Math.floor(minutes / 60);
          var days = Math.floor(hours / 24);
          timestamp = days >= 1 ? days + " day" + (days > 1 ? "s" : "") : (
            hours >= 1 ? hours + " hour" + (hours > 1 ? "s" : "") : (
              minutes >= 1 ? minutes + " minute" + (minutes > 1 ? "s" : "") : seconds + " second" + (seconds > 1 ? "s" : "")
            )
          );
        } else {
          timestamp = -1;
        };
      };
      
      const AmountOfContributors = this.props.contributors ? this.props.contributors.length : 0;
      var bubbleSpans = [];
      for (var i = 0; (AmountOfContributors > 3 ? 3 : AmountOfContributors) > i; i++) {
        bubbleSpans.push(<Link to={"/wiki/user/" + this.props.contributors[i].username}><img src={"/api/user/avatar?username=" + this.props.contributors[i].username} title={this.props.contributors[i].username} /></Link>);
      };
      
      return (
        <>
          <Outline exists={this.props.exists} articleName={this.props.articleName} headers={this.state.headers} />
          <article id="article-container" onSelect={this.selectText} >
            <div id="article-metadata">
              <h1 id="article-name">{this.props.articleName}</h1>
              {this.props.location.redirectedFrom ? <div id="article-redirect-notif">Redirected from <Link to={this.props.location.redirectedFrom + "?redirect=no"}>{this.props.location.redirectedFrom}</Link></div> : undefined}
              <div id="article-contributors">{
                timestamp ? (
                  <>
                    <div id="article-contributor-bubbles">{bubbleSpans}</div>
                    <div id="article-contribs-text">
                      <span id="article-contributors-amount">{AmountOfContributors + " contributor" + (AmountOfContributors > 1 ? "s" : "")}</span>
                      <span id="article-contribs-divider">•</span>
                      <span id="article-update-time">{"Updated " + (timestamp < 0 ? "just now" : timestamp + " ago")}</span>
                    </div>
                  </>
                ) : "No contributors . . . but you could be one 😳"
              }</div>
            </div>
            <div id="article-content" contentEditable={this.props.edit ? true : undefined} suppressContentEditableWarning={true}>{
              this.props.exists ? this.state.content : <div>This article doesn't exist. Why not <Link to={"/wiki/article/" + this.props.specialName + "/edit?mode=source"}>create it</Link>?</div>
            }</div>
          </article>
          {this.props.edit ? (<>
            <div id="editor-formatter">
              <div id="editor-formatter-common">
                <button onClick={() => this.formatText("b")}>B</button>
                <button onClick={() => this.formatText("i")}>I</button>
                <button onClick={() => this.formatText("u")}>U</button>
                <button onClick={() => this.openLinkFormatter()}>L</button>
              </div>
              <select id="editor-formatter-heading" onChange={this.changeHeading}>
                <option value="p">Normal text</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
            </div>
            <div id="link-formatter">
              <div id="link-formatter-ui">
                <form onSubmit={this.formatLink}>
                  <div>
                    <div className="link-formatter-ui-label">Text</div>
                    <input id="link-formatter-ui-text" type="text" required />
                  </div>
                  <div>
                    <div className="link-formatter-ui-label">Link URL</div>
                    <input id="link-formatter-ui-url" type="url" required />
                  </div>
                  <input type="submit" />
                </form>
              </div>
            </div>
          </>) : null}
        </>
      );
    }
  };
};

export default withRouter(Article);