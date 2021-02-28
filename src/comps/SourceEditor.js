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
    
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    
    this.state = {
      source: props.source,
      updatingArticle: false,
      sessionToken: getCookie("MakuwikiSessionToken")
    }
  };
  
  async updateArticle(event) {
    event.preventDefault();
    
    // Make sure we aren't already sending it 
    if (this.state.updatingArticle) return;
    this.setState({updatingArticle: true});
    
    // Send off the text
    let aOrT = this.props.template ? "template" : "article";
    console.log("Sending request to update " + aOrT + "...");
    
    let response;
    try {
      
      response = await fetch("/api/" + aOrT + "/" + this.props.specialName, {
        method: this.props.source ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          sessionToken: this.state.sessionToken
        },
        body: JSON.stringify({
          source: this.state.source
        })
      });
      
      if (!response.ok) {
        throw new Error(response);
      };
      
      console.log("Updated " + aOrT + "!");
      this.props.history.push("/wiki/" + aOrT + "/" + this.props.specialName);
      
    } catch (err) {
      console.warn("Couldn't update " + aOrT + ": " + err);
      this.setState({updatingArticle: false});
    };
    
  };
  
  async componentDidMount() {
    
    // Let's make sure the user's logged in
    const SessionToken = this.state.sessionToken;
    if (!SessionToken) {
      this.props.history.push("/wiki/login?redirect=" + window.location.pathname);
      return;
    };
    
    var loggedIn = false;
    
    try {
      const Response = await fetch("/api/user/session", {
        headers: {
          sessionToken: SessionToken
        }
      });
      if (Response.ok) {
        loggedIn = true;
      };
    } catch (err) {
      
    };
    
    if (!loggedIn) {
      this.props.history.push("/wiki/login?redirect=" + window.location.pathname)
    };
    
  };
  
  handleChange(event) {
    this.setState({source: event.target.value});
  };
  
  render() {
    return (
      <>
        <div id="editor-article-info" ref={this.metadataRef}>
          <div id="editor-name-notif">You are editing the source of</div>
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