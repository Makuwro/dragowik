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
    }
  };
  
  componentDidMount() {
    /*
    // This makes the page flash on back button
    const {history} = this.props;
    window.onpopstate = (event) => {
      event.preventDefault();
      if (this.articleRef.current.classList.contains("visible")) {
        this.articleRef.current.classList.remove("visible");
      };
    };*/ 
    setTimeout(() => this.articleRef.current.classList.add("visible"), 300);
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