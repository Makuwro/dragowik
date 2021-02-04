import React from "react";
import "../styles/article.css";
import {Link} from "react-router-dom";
import parse, {domToReact} from "html-react-parser";
import { v4 as uuidv4 } from "uuid";

class Article extends React.Component {
  
  constructor(props) {
    super(props);
    this.articleRef = React.createRef();
  };
  
  componentDidMount() {
    setTimeout(() => this.articleRef.current.classList.toggle("visible"), 300);
  }
  
  render() {
    
    return (
      <article ref={this.articleRef}>
        <div id="article-metadata">
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
          this.props.content.map((element) => {
            return parse("<" + element[0] + " key={" + uuidv4() + ">" + element[1] + "</" + element[0] + ">", {
              replace: (domNode) => {
                return domNode.children ? (domNode.name === "a" ? <Link to={domNode.attribs.href}>{domToReact(domNode.children)}</Link> : domNode) : undefined;
              }
            })
          })
        }</div>
      </article>
    );
  };
};

export default Article;