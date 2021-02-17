import React from "react";
import {withRouter} from "react-router-dom";
import "../styles/user.css";

class User extends React.Component {
  
  constructor(props) {
    super(props);
  };
  
  async componentDidMount() {
    
  };
  async componentDidUpdate(prevProps) {
    
  };
  
  render() {
    return (
      <>
        <div id="user-info">
          <img src="/icons/avatar-159236_1280.png" id="user-avatar-image" />
          <div id="user-name">{this.props.username}</div>
        </div>
        <div id="user-history">{this.props.username + " hasn't contributed anything yet!"}</div>
      </>
    );
  };
};

export default withRouter(User);