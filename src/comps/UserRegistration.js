import React from "react";
import "../styles/registration.css";

class UserRegistration extends React.Component {
  
  constructor(props) {
    super(props);
  };
  
  validateData() {
    
  };
  
  submitForm(e) {
    e.preventDefault();
    return false;
  };
  
  render() {
    return (
      <div id="registration">
        <div id="registration-notice">To edit and comment on articles, you need an account</div>
        <form id="registration-form" onSubmit={this.submitForm}>
          <div className="registration-section">
            <div>Username</div>
            <input type="text" name="makuwro-username" required />
          </div>
          
          <div className="registration-section">
            <div>Password</div>
            <input type="password" className="password" name="makuwro-password" required />
          </div>
          
          <div className="registration-section">
            <div>Email address</div>
            <input type="email" name="email" required />
          </div>
          
          <div id="registration-terms" className="registration-section">
            <input type="checkbox" name="terms-agree" required />
            <label for="terms-agree">I agree to the <a target="_blank" href="/wiki/project/terms">contributor guidelines</a></label>
          </div>
          
          <div id="registration-submit">
            <input type="submit" value="Hit it!" />
          </div>
          
        </form>
      </div>
    );
  };
};

export default UserRegistration;