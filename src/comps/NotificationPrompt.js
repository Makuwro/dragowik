import React from "react";
import "../styles/notification-prompt.css";

class NotificationPrompt extends React.Component {
  
  constructor(props) {
    super(props);
  };
  
  render() {
    return (
      <div id="notification-prompt" className={!this.props.visible ? "notification-invisible" : undefined}>
        <div id="notification-message">{this.props.message}</div>
      </div>
    );
  };
  
};

export default NotificationPrompt;