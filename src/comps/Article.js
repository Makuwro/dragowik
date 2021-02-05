import React from "react";
import "../styles/article.css";
import {withRouter, Redirect} from "react-router-dom";
import parse, {domToReact} from "html-react-parser";
import { v4 as uuidv4 } from "uuid";

const RedirectRegex = /#REDIRECT \[\[(\w+)\]\]/g;
const ArticleNameRegex = /\/wiki\/article\/(\w+)/g

class Article extends React.Component {
  
  constructor(props) {
    super(props);
    this.articleRef = React.createRef();
    this.metadataRef = React.createRef();
    this.vanishArticle = this.vanishArticle.bind(this);
    this.redirectArticle = this.redirectArticle.bind(this);
    this.checkArticleLinks = this.checkArticleLinks.bind(this);
    
    var firstElement = this.props.content ? this.props.content[0] : undefined;
    var redirectArticleName;
    if (firstElement) {
      if (firstElement[0] === "div") {
        var redirectArticle = [...firstElement[1].matchAll(RedirectRegex)][0];
        redirectArticleName = redirectArticle ? redirectArticle[1] : undefined;
      };
    };
    
    this.state = {
      redirectArticleName: redirectArticleName,
      nonExistentArticles: {}
    }
  };
  
  async componentDidMount() {
    this.checkArticleLinks();
    if (!this.state.redirectArticleName) { 
      setTimeout(() => this.articleRef.current.classList.add("visible"), 300);
    };
  };
  
  componentDidUpdate() {
    if (this.props.location.redirectedFrom && this.state.redirectArticleName) {
      this.setState({redirectArticleName: undefined});
    };
    
    if (!this.state.redirectArticleName) {
      setTimeout(() => {
        this.articleRef.current.classList.add("visible");
      }, 300);
    };
  };
  
  vanishArticle(event) {
    event.preventDefault();
    this.articleRef.current.classList.remove("visible");
    
    const {history} = this.props;
    setTimeout(() => history.push(event.target.getAttribute("href")), 300);
  };
  
  redirectArticle() {
    console.log("Redirecting from " + this.props.articleName + " to " + this.state.redirectArticleName);
    return <Redirect to={{
      pathname: "/wiki/article/" + this.state.redirectArticleName,
      redirectedFrom: this.props.articleName
    }} />
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
    
    this.props.content.map(async element => {
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
    });
  };
  
  render() {
    if (this.state.redirectArticleName && !this.props.location.redirectedFrom) {
      return (this.redirectArticle());
    } else {
      return (
        <article ref={this.articleRef}>
          <div id="article-metadata" ref={this.metadataRef}>
            <h1 id="article-name">{this.props.articleName}</h1>
            <div id="article-contributors">
              <div id="article-contributor-bubbles">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span id="article-contributors-amount">0 contributors</span>
              <span id="article-contribs-divider">•</span>
              <span id="article-update-time">Just updated</span>
            </div>
          </div>
          <div id="article-content">{
            this.props.exists ? this.props.content.map((element) => {
              
              return parse("<" + element[0] + " key={" + uuidv4() + ">" + element[1] + "</" + element[0] + ">", {
                replace: (domNode) => {
                  if (domNode.children) {
                    if (domNode.name === "a") {
                      var articleExists = this.state.nonExistentArticles[domNode.attribs.href] ? false : true; // returns unresolved promise
                      return <a onClick={this.vanishArticle} href={domNode.attribs.href} title={!articleExists ? "This article doesn't exist! Why don't we change that?" : "oops"} className={!articleExists ? "article-link-invalid" : undefined}>{domToReact(domNode.children)}</a>;
                    };
                    return domNode;
                  };
                }
              })
            }) : <div>This article doesn't exist!</div>
          }</div>
        </article>
      );
    }
  };
};

export default withRouter(Article);