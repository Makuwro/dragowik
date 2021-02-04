import React from "react";
import "../styles/article.css";
import "../styles/editor.css";
import {withRouter} from "react-router-dom";
import parse from "html-react-parser";
import { v4 as uuidv4 } from "uuid";

class Editor extends React.Component {
  
  constructor(props) {
    super(props);
    this.articleRef = React.createRef();
    this.metadataRef = React.createRef();
  };
  
  componentDidMount() {
    setTimeout(() => this.articleRef.current.classList.toggle("visible"), 300);
  };
  
  handleChange(e) {
    
  };
  
  render() {
    return (
      <div>
        <header id="editor-format">
          <button id="editor-format-finished">
            <img src="/icons/checkmark.png" alt="" />
          </button>
        </header>
        <article ref={this.articleRef}>
          <div id="article-metadata" ref={this.metadataRef} className="uneditable">
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
              return parse("<" + element[0] + '>' + element[1] + "</" + element[0] + ">", {
            })
          }</div>
        </article>
      </div>
    );
  };
};

export default withRouter(Editor);