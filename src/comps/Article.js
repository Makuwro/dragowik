import React from "react";
import "../styles/article.css";
import {BrowserRouter as Router, Link} from "react-router-dom";
import parse, {domToReact} from "html-react-parser";

class Article extends React.Component {
  
  constructor(props) {
    super(props);
  };
  
  render() {
    return (
      <Router>
        <article>
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
          <div id="article-content">
            <h1>Description</h1>
            <h2>Role in the story</h2>
            <div>
              <b>Dream</b> is the main antagonist of The Showrunners. He is a major character of <Link to="/wiki/Book-3">Books 3</Link> and <Link to="/wiki/Book-4">4</Link>.
            </div>
          </div>
        </article>
      </Router>
        <div id="article-content">{
          this.props.content.map((element) => {
            return parse("<" + element[0] + ">" + element[1] + "<" + element[0] + "/>", {
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