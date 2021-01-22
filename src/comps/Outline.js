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
              <h1>Description</h1>
              <h2>Role in the story</h2>
              <h2>Physical description</h2>
              <h3>Book 1: Trust and Safety</h3>
              <h3>Book 2: The Worldender</h3>
              <h3>Book 3: Now in Color</h3>
              <h3>Book 4: Teamwork vs. Dream's Work</h3>
              <h1>Biography</h1>
              <h2>Before Book 1</h2>
              <h2>Book 1: Trust and Safety</h2>
              <h2>Book 2: The Worldender</h2>
              <h2>Book 3: Now in Color</h2>
              <h2>Book 4: Teamwork vs. Dream's Work</h2>
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