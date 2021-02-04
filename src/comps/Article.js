import React from "react";
import "../styles/article.css";
import {withRouter} from "react-router-dom";
import parse, {domToReact} from "html-react-parser";
import { v4 as uuidv4 } from "uuid";

class Article extends React.Component {
  
  constructor(props) {
    super(props);
    this.articleRef = React.createRef();
    this.metadataRef = React.createRef();
    this.vanishArticle = this.vanishArticle.bind(this);
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
    setTimeout(() => {
      this.articleRef.current.classList.add("visible");
    }, 300);
  };
  
  vanishArticle(event) {
    event.preventDefault();
    this.articleRef.current.classList.remove("visible");
    
    const {history} = this.props;
    setTimeout(() => history.push(event.target.getAttribute("href")), 300);
  };
  
  render() {
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
                return domNode.children ? (domNode.name === "a" ? <a onClick={this.vanishArticle} href={domNode.attribs.href}>{domToReact(domNode.children)}</a> : domNode) : undefined;
              }
            })
          }) : <div>This article doesn't exist!</div>
        }</div>
      </article>
    );
  };
};

export default withRouter(Article);