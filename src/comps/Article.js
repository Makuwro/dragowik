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

class Article extends React.Component {
  
  constructor(props) {
    super(props);
    this.articleRef = React.createRef();
    this.metadataRef = React.createRef();
    this.nonExistentArticles = [];
    this.linksToCheck = [];
    this.vanishArticle = this.vanishArticle.bind(this);
    this.checkArticleLinks = this.checkArticleLinks.bind(this);
    this.fixSource = this.fixSource.bind(this);
    this.generateMarkup = this.generateMarkup.bind(this);
    
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
    };
    
    if (!this.state.redirectArticleName && this.articleRef.current) { 
      setTimeout(() => this.articleRef.current.classList.add("visible"), 300);
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
            }
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
        if (this.articleRef.current) {
          this.articleRef.current.classList.add("visible");
        };
      }, 300);
    };
  };
  
  vanishArticle(event) {
    event.preventDefault();
    this.articleRef.current.classList.remove("visible");
    
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
  
  render() {
    if (this.state.redirectArticleName && !this.props.location.redirectedFrom) {
      console.log("Redirecting from " + this.props.articleName + " to " + this.state.redirectArticleName);
      return <Redirect to={{
        pathname: "/wiki/article/" + this.state.redirectArticleName,
        redirectedFrom: this.props.articleName
      }} />
    } else {
      return (
        <div>
          <Outline exists={this.props.exists} articleName={this.props.articleName} headers={this.state.headers} />
          <article id="article-container" ref={this.articleRef}>
            <div id="article-metadata" ref={this.metadataRef}>
              <h1 id="article-name">{this.props.articleName}</h1>
              {this.props.location.redirectedFrom ? <div id="article-redirect-notif">Redirected from <Link to={this.props.location.redirectedFrom + "?redirect=no"}>{this.props.location.redirectedFrom}</Link></div> : undefined}
              <div id="article-contributors">
                <div id="article-contributor-bubbles">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div id="article-contribs-text">
                  <span id="article-contributors-amount">0 contributors</span>
                  <span id="article-contribs-divider">•</span>
                  <span id="article-update-time">Just updated</span>
                </div>
              </div>
            </div>
            <div id="article-content">{
              this.props.exists ? this.state.content : <div>This article doesn't exist. Why not <Link to={"/wiki/article/" + this.props.specialName + "/edit?mode=source"}>create it</Link>?</div>
            }</div>
          </article>
        </div>
      );
    }
  };
};

export default withRouter(Article);