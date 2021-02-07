import React from "react";
import "../styles/article.css";
import {withRouter, Redirect, Link} from "react-router-dom";
import parse, {domToReact} from "html-react-parser";
import Outline from "./Outline";

const RedirectRegex = /#REDIRECT \[\[(\w+)\]\]/g;
const ArticleNameRegex = /\/wiki\/article\/(\w+)/g;
const WikiMarkupRegex = /(# (?<h1>.+))|(## (?<h2>.+))|(### (?<h3>.+))|(?<element><(\w+?)( (?<elementAttribs>\w+=".+?|")|)>(?<elementText>.+?)<\/\w+?>)|(\[\[(?<aBracket>.+?)\]\])|(\*\*(?<bAsterisk>(.+))\*\*)|\n+?(?<newLine>[^#]+)/gm;

function isHeader(tag) {
  return typeof({"h1": true, "h2": true, "h3": true}[tag]) === "boolean";
};

class Article extends React.Component {
  
  constructor(props) {
    super(props);
    this.articleRef = React.createRef();
    this.metadataRef = React.createRef();
    this.headerRefs = [];
    this.vanishArticle = this.vanishArticle.bind(this);
    this.checkArticleLinks = this.checkArticleLinks.bind(this);
    
    var redirectArticleName;
    var source = this.props.redirect ? props.source : false;
    if (source) {
      var redirectArticle = [...source.matchAll(RedirectRegex)][0];
      redirectArticleName = redirectArticle ? redirectArticle[1] : undefined;
    };
    
    var SourceMarkup = this.generateMarkup();
    var content = parse(SourceMarkup, {
      replace: (domNode) => {
        if (isHeader(domNode.name)) {
          return React.createElement(domNode.name, {
            ref: ref => {
              this.headerRefs.push(ref);
              this.setState({headers: this.headerRefs})
            }
          }, domToReact(domNode.children));
        } else if (domNode.children) {
          if (domNode.name === "a") {
            var articleExists = this.state.nonExistentArticles[domNode.attribs.href] ? false : true; // returns unresolved promise
            return <a onClick={this.vanishArticle} href={domNode.attribs.href} title={!articleExists ? "This article doesn't exist! Why don't we change that?" : undefined} className={!articleExists ? "article-link-invalid" : undefined}>{domToReact(domNode.children)}</a>;
          };
          return domNode;
        };
      }
    });
    
    this.state = {
      redirectArticleName: redirectArticleName,
      nonExistentArticles: {},
      content: content
    };
    
  };
  
  async componentDidMount() {
    this.checkArticleLinks();
    if (!this.state.redirectArticleName && this.articleRef.current) { 
      setTimeout(() => this.articleRef.current.classList.add("visible"), 300);
    };
  };
  
  componentDidUpdate(prevProps) {
    
    if (this.props.location.redirectedFrom && this.state.redirectArticleName) {
      this.setState({redirectArticleName: undefined});
    };
    
    if (!this.state.redirectArticleName) {
      
      if (prevProps.source !== this.props.source) {
        this.headerRefs = [];
        
        var SourceMarkup = this.generateMarkup();
        var content = parse(SourceMarkup, {
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
                var articleExists = this.state.nonExistentArticles[domNode.attribs.href] ? false : true; // returns unresolved promise
                return <a onClick={this.vanishArticle} href={domNode.attribs.href} title={!articleExists ? "This article doesn't exist! Why don't we change that?" : undefined} className={!articleExists ? "article-link-invalid" : undefined}>{domToReact(domNode.children)}</a>;
              };
              return domNode;
            };
          }
        });
        
        this.setState({content: content});
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
  
  checkArticleLinks() {
    // Make sure we got something to work with
    if (!this.props.content) return;
    
    async function articleExists(possibleName) {
      console.log("Checking if " + possibleName + " exists...");
      const ArticleNameArray = [...possibleName.matchAll(ArticleNameRegex)][0];
      const ArticleName = ArticleNameArray ? ArticleNameArray[1] : undefined;
      
      if (!ArticleName) return false;
      
      // Now let's check with the server
      var articleExists = false;
      try {
        const Response = await fetch("/api/article/" + ArticleName);
        if (Response.ok) {
          articleExists = true;
        };
      } catch (err) {
        console.warn("Couldn't verify that " + ArticleName + " exists. Assuming it doesn't exist.");
      };
      
      return articleExists;
    }
    /*
    this.props.source.map(async element => {
      
      console.log("hey");
      
      var elementChildren = parse("<" + element[0] + " key={" + uuidv4() + ">" + element[1] + "</" + element[0] + ">").props.children;
      var childrenObjects = typeof(elementChildren) === "object" ? elementChildren.filter(child => { return typeof(child) === "object" }) : undefined;
      if (!childrenObjects) return;
      
      for (var i = 0; childrenObjects.length > i; i++) {
        
        // Only get links
        if (childrenObjects[i].type !== "a") continue;
        
        // Let's verify them
        var articleLocation = childrenObjects[i].props.href;
        var blueLink = await articleExists(articleLocation);
        if (!blueLink) {
          
          // Let's make
          var newNEAs = this.state.nonExistentArticles;
          newNEAs[articleLocation] = true;
          this.setState({
            nonExistentArticles: newNEAs
          });
          
        };
        
      };
    }); */
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
              
              switch (ChildMatch[0]) {
                
                case "bAsterisk":
                  const ChildText = ChildMatches[x].groups[ChildMatch[0]];
                  const ElementName = ChildMatch[0] === "bAsterisk" ? "b" : (
                    ChildMatch[0] === "aBracket" ? "a" : undefined
                  );
                  text = text.replace(ChildMatches[x][0], "<" + ElementName + ">" + ChildText + "</" + ElementName + ">");
                  break;
                  
                default:
                  break;
                
              };
              
            };
            
          };
          
          var possibleReplacement = isHeader(Match[0]) ? text.replaceAll(/[^a-zA-Z0-9 ]/g, "", "").replaceAll(" ", "_") : undefined;
          var headerId = possibleReplacement;
          if (possibleReplacement) {
            var x = 0;
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
            (Match[0] === "newLine" ? "div" : Match[0])) +
            (headerId ? " id=" + headerId : "") +
            ">" + 
            text + 
            "</" + (Match[0] === "bAsterisk" ? "b" : 
            (Match[0] === "newLine" ? "div" : Match[0])) + ">");
          
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