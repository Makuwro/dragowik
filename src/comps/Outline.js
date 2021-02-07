import React from "react";
import "../styles/navigation.css";
import { v4 as uuidv4 } from "uuid";

class Outline extends React.Component {
  
  constructor(props) {
    super(props);
    this.navRef = React.createRef();
    this.showButton = React.createRef();
  };
  
  toggleMenu() {
    const navRef = this.navRef.current;
    navRef.classList.toggle("nav-closed");
    navRef.classList.toggle("outline-invisible");
  };
  
  render() {
    if (this.props.exists) {
      return (
        <div id="outline">
          <nav ref={this.navRef} className="nav-closed outline-invisible">
            <div id="no-img-header">
              Outline
            </div>
            
            <div id="nav-topic-name">
              <div id="nav-topic-name-text">{this.props.articleName}</div>
            </div>
            
            <div id="nav-outline">
              <div id="nav-outline-header">
                Outline
              </div>
              
              <div id="nav-outline-list">{this.props.headers ? this.props.headers.map(headerId => 
                React.createElement(headerId.tagName.toLowerCase(), {
                  key: uuidv4()
                }, headerId.textContent)
              ) : undefined}</div>
            </div>
            
            <div id="nav-close">
              <button onClick={() => {
                console.log("Close button pressed");
                this.toggleMenu();
              }}>
                <svg>    
                  <image href="/svgs/cross.svg" width="100%" height="100%"/>    
                </svg>
                <div>
                  Close
                </div>
              </button>
            </div>
          </nav>
          <button id="show-outline" ref={this.showButton} onClick={() => {
            console.log("Open button pressed");
            this.toggleMenu();
          }}>
            <div>
              Show outline
            </div>
          </button>
        </div>
      );
    } else {
      return (null);
    };
  };
};

export default Outline;