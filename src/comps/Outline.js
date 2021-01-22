import React from "react";
import "../styles/navigation.css";

class Outline extends React.Component {
  
  constructor(props) {
    super(props);
    this.navRef = React.createRef();
  };
  
  toggleMenu() {
    const navRef = this.navRef.current;
    navRef.classList.toggle("nav-closed");
    navRef.classList.toggle("invisible");
  };
  
  render() {
    return (
      <div id="outline">
        <nav ref={this.navRef} className="nav-closed invisible">
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
            
            <div id="nav-outline-list">
              {this.props.headers.map((header) => {
                return ["h1","h2","h3","h4","h5","h6"].find((e) => {
                  return e === header[0]
                }) ? React.createElement(header[0], {}, header[1]) : undefined;
              })}
            </div>
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
        <button id="show-outline" onClick={() => {
          console.log("Open button pressed");
          this.toggleMenu();
        }}>
          <div>
            Show outline
          </div>
        </button>
      </div>
    );
  };
};

export default Outline;