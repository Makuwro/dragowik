import React from "react";
import "../styles/registration.css";
import NotificationPrompt from "./NotificationPrompt";
import { withRouter } from "react-router-dom";

class UserRegistration extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email: "",
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
  
  async submitForm(e) {
    
    e.preventDefault();
    
    if (this.serverProcessing) {
      return;
    };
    
    this.setServerProcessing(true);
    
    var response;
    try {
      
      response = await fetch("/api/user", {
        method: "POST",
        headers: {
          password: this.state.password,
          email: this.state.email,
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({
          username: this.state.username
        })
      });
      
      if (!response.ok) {
        throw response;
      };
      
      this.props.history.push("/wiki/login");
      
    } catch (err) {
      switch (response.status) {
        case 409: 
          console.log("Username " + this.state.username + " cannot be re-claimed");
          this.newErrorPrompt("Sorry, username's already claimed!");
          
          break;
          
        case 500:
          console.log("Buzzkill! Server error. We can't create your account right now.");
          this.newErrorPrompt("Buzzkill! Server error. We can't create your account right now.");
          
        default:
          break;
      };
      this.setServerProcessing(false);
    };
    
    return false;
  };
  
  updateValue(event, area) {
    this.setState({
      [area]: event.target.value
    });
  };
  
  render() {
    
    return (
      <div>
        <NotificationPrompt visible={this.state.notificationVisible} message={this.state.notificationMessage} />
        <div id="registration">
          <div id="registration-notice">To edit and comment on articles, you need an account</div>
          <form id="registration-form" onSubmit={this.submitForm}>
            <div className="registration-section">
              <div>Username</div>
              <input type="text" value={this.state.username} onChange={event => this.updateValue(event, "username")} name="makuwro-username" required />
            </div>
            
            <div className="registration-section">
              <div>Password</div>
              <input type="password" value={this.state.password} onChange={event => this.updateValue(event, "password")} className="password" name="makuwro-password" required />
            </div>
            
            <div className="registration-section">
              <div>Email address</div>
              <input type="email" value={this.state.email} onChange={event => this.updateValue(event, "email")}  name="email" required />
            </div>
            
            <div id="registration-terms" className="registration-section">
              <input type="checkbox" name="terms-agree" required />
              <label htmlFor="terms-agree">I agree to the <a target="_blank" href="/wiki/project/terms">contributor guidelines</a></label>
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

export default withRouter(UserRegistration);