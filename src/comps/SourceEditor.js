import React from "react";
import "../styles/article.css";
import "../styles/editor-source.css";
import {withRouter} from "react-router-dom";

class SourceEditor extends React.Component {
  
  constructor(props) {
    super(props);
    this.metadataRef = React.createRef();
    
    this.handleChange = this.handleChange.bind(this);
    this.updateArticle = this.updateArticle.bind(this);
    
    this.state = {
      source: props.source,
      updatingArticle: false
    }
  };
  
  componentDidMount() {
    //setTimeout(() => this.editorRef.current.classList.toggle("visible"), 300);
  };
  
  async updateArticle(event) {
    event.preventDefault();
    
    // Make sure we aren't already sending it 
    if (this.state.updatingArticle) return;
    this.setState({updatingArticle: true});
    
    // Send off the text
    console.log("Sending request to update article...");
    
    var response;
    try {
      
      response = await fetch("/api/article/" + this.props.specialName, {
        method: this.props.source ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          source: this.state.source
        })
      });
      
      if (!response.ok) {
        throw new Error(response);
      };
      
      console.log("Updated article!");
      this.props.history.push("/wiki/article/" + this.props.specialName);
      
    } catch (err) {
      console.warn("Couldn't update article: " + err);
      this.setState({updatingArticle: false});
    };
    
  };
  
  handleChange(event) {
    this.setState({source: event.target.value});
  };
  
  render() {
    return (
      <>
        <div id="editor-article-info" ref={this.metadataRef}>
          <h1 id="editor-article-name">{this.props.articleName}</h1>
        </div>
        <form id="editor-source-form" onSubmit={this.updateArticle}>
          <textarea id="editor-source-textarea" value={this.state.source} onChange={this.handleChange} />
          <input type="submit" value={(this.props.source ? "Update" : "Create") + " Article"} />
        </form>
      </>
    );
  };
};

export default withRouter(SourceEditor);