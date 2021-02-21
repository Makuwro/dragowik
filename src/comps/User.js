import React from "react";
import {withRouter} from "react-router-dom";
import "../styles/user.css";

class User extends React.Component {
  
  constructor(props) {
    super(props);
    this.setAvatar = this.setAvatar.bind(this);
    
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    
    const SessionToken = getCookie("MakuwikiSessionToken");
    this.state = {
      sessionToken: SessionToken
    }
  };
  
  async componentDidMount() {
    
    // Get the current user's ID
    var userInfo;
    try {
      var userInfoResponse = await fetch("/api/user?username=" + this.props.username);
      if (userInfoResponse.ok) {
        userInfo = await userInfoResponse.json();
      };
    } catch (err) {
      console.warn("Couldn't get " + this.props.username + "'s user info: " + err);
    };
    
    if (this.state.sessionToken) {
      // Check if this is our user profile
      var ownProfile = false;
      try {
        const Response = await fetch("/api/user/session?id=" + userInfo.id, {
          headers: {
            sessionToken: this.state.sessionToken
          }
        });
        
        if (Response.ok) {
          ownProfile = true;
        };
      } catch (err) {
        console.warn("Couldn't verify that the current user owns the current profile: " + err);
      };
      
      if (ownProfile) this.setState({own: true});
    };
    
  };
  async componentDidUpdate(prevProps) {
    
  };
  
  async setAvatar(fileList) {
    
    // Set the avatar up to be sent
    const AvatarData = new FormData();
    AvatarData.append("avatar", fileList[0]);
    
    console.log("Uploading file to server...");
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: {
          sessionToken: this.state.sessionToken
        },
        body: AvatarData
      });
    } catch (err) {
      
    };
    
  };
  
  render() {
    
    var userAvatarElement = <img src={"/api/user/avatar?username=" + this.props.username} id="user-avatar-image" className={this.state.own ? "user-avatar-image-own" : undefined} />;
    userAvatarElement = this.state.own ? 
      (
        <>
          <label for="user-avatar-image-input">{userAvatarElement}</label>
          <input id="user-avatar-image-input" type="file" accept=".png,.jpg,.gif" onChange={e => this.setAvatar(e.target.files)} />
        </>
      ) : userAvatarElement;
    
    return (
      <>
        <div id="user-info">
          <>{userAvatarElement}</>
          <div id="user-name">{this.props.username}</div>
        </div>
        <div id="user-history">{this.props.username + " hasn't contributed anything yet!"}</div>
      </>
    );
  };
};

export default withRouter(User);