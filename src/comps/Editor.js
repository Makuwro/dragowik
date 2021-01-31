import React from "react";
import "../styles/article.css";
import "../styles/editor.css";
import {useRouteMatch, withRouter} from "react-router-dom";
import parse, {domToReact} from "html-react-parser";

class Editor extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      articleName: this.props.match.params.name
    };
  };
  
  render() {
    return (
      <div>
        <header id="editor-format">
          <button id="editor-format-finished">
            <img src="/icons/checkmark.png" />
          </button>
        </header>
        <article>
          <div id="article-metadata" className="uneditable">
            <h1 id="article-name">{this.state.articleName}</h1>
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
              return parse("<" + element[0] + ' contenteditable="true">' + element[1] + "<" + element[0] + "/>")
            })
          }</div>
        </article>
      </div>
    );
  };
};

export default withRouter(Editor);