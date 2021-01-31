import React from "react";
import "../styles/registration.css";
import NotificationPrompt from "./NotificationPrompt";
import {Link, withRouter} from "react-router-dom";

class UserLogin extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      notificationVisible: false,
      notificationMessage: "",
      serverProcessing: false,
      notifTimeout: null,
      takenUsernames: []
    };
    
    this.submitForm = this.submitForm.bind(this);
  };
  
  setServerProcessing(processing) {
    this.setState({serverProcessing: processing});
  };
  
  setNotificationTimeout(timeout) {
    this.setState({notifTimeout: timeout});
  };
  
  newErrorPrompt(message) {
    this.setState({
      notificationMessage: message,
      notificationVisible: true
    });
    
    if (this.notifTimeout) clearTimeout(this.notifTimeout);
    
    this.notifTimeout = setTimeout(() => {
      this.setState({
        notificationVisible: false,
        notifTimeout: null
      });
    }, 3000);
  };
  
  updateValue(event, area) {
    this.setState({
      [area]: event.target.value
    });
  };
  
  async submitForm(e) {
    
    e.preventDefault();
    
    if (this.serverProcessing) {
      return;
    };
    
    this.setServerProcessing(true);
    
    var response;
    try {
      
      response = await fetch("/api/user/session", {
        method: "PUT",
        headers: {
          password: this.state.password,
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({
          username: this.state.username
        })
      });
      
      if (!response.ok) {
        throw response;
      };
      
      this.props.history.push("/");
      
    } catch (err) {
      switch (response.status) {
        case 403: 
          console.log("Entered wrong password for " + this.state.username);
          this.newErrorPrompt("Wrong password");
          break;
          
        case 404:
          console.log("User " + this.state.username + " doesn't exist");
          this.newErrorPrompt("That user doesn't exist!");
          break;
          
        case 500:
          console.log("Buzzkill! Server error. We can't log you in right now.");
          this.newErrorPrompt("Buzzkill! Server error. We can't log you in right now.");
          break;
          
        default:
          console.log("Unknown login error");
          this.newErrorPrompt("An unknown error happened");
          console.warn(err);
          break;
      };
      this.setServerProcessing(false);
    };
    
    return false;
  };
  
  render() {
    return (
      <div>
        <NotificationPrompt visible={this.state.notificationVisible} message={this.state.notificationMessage} />
        <div id="registration">
          <div id="registration-notice">Welcome back to the wiki!</div>
          <form id="registration-form" onSubmit={this.submitForm}>
            <div className="registration-section">
              <div>Username</div>
              <input type="text" value={this.state.username} onChange={event => this.updateValue(event, "username")} name="makuwro-username" required />
            </div>
            
            <div className="registration-section">
              <div>Password</div>
              <input type="password" value={this.state.password} onChange={event => this.updateValue(event, "password")} className="password" name="makuwro-password" required />
            </div>
            
            <div id="registration-terms">
              <div>Don't have an account? <Link to="/wiki/register">Click here to create one!</Link></div>
            </div>
            
            <div id="registration-submit" className={this.state.serverProcessing ? "registration-submit-disabled" : undefined}>
              <input type="submit" value={this.state.serverProcessing ? "PLEASE WAIT" : "Hit it!"} />
            </div>
            
          </form>
        </div>
      </div>
    );
  };
};

export default withRouter(UserLogin);