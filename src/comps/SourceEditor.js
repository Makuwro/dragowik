import React from "react";
import "../styles/article.css";
import "../styles/editor-source.css";
import {withRouter} from "react-router-dom";

class SourceEditor extends React.Component {
  
  constructor(props) {
    super(props);
    //this.editorRef = React.createRef();
    this.metadataRef = React.createRef();
  };
  
  componentDidMount() {
    //setTimeout(() => this.editorRef.current.classList.toggle("visible"), 300);
  };
  
  updateArticle() {
    
  };
  
  render() {
    return (
      <div>
        <div id="article-metadata" ref={this.metadataRef}>
          <h1 id="article-name">{this.props.articleName}</h1>
        </div>
        <form id="editor-source-form">
          <textarea id="editor-source-textarea">{this.props.source}</textarea>
          <input type="submit" value={(this.props.source ? "Update" : "Create") + " Article"} />
        </form>
      </div>
    );
  };
};

export default withRouter(SourceEditor);