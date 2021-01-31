import React from "react";
import "../styles/header.css";
import {withRouter} from "react-router";

class Header extends React.Component {
  
  constructor(props) {
    super(props);
  };
  
  render() {
    return (
      <header>
        <div id="header-wiki-name">{this.props.wikiName}</div>
      </header>
    );
  };
};

export default withRouter(Header);