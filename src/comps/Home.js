import React from "react";
import "../styles/home.css";
import {withRouter} from "react-router-dom";

class Home extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      searchValue: ""
    };
    this.homeRef = React.createRef();
  };
  
  handleSearchChange(event) {
    this.setState({
      searchValue: event.target.value
    });
  };
  
  handleSearchSubmit(event) {
    event.preventDefault();
    this.homeRef.current.classList.toggle("swoop");
    setTimeout(() => this.props.history.push("/wiki/article/" + this.state.searchValue.replace(/\s+/g, "_")), 500);
  };
  
  render() {
    
    return (
      <div id="home-parent">
        <div id="home" ref={this.homeRef}>
          <div id="home-welcome">Welcome to the wiki!</div>
          <div id="home-search">
            <div id="home-search-guide">Why not search for an article?</div>
            <form onSubmit={event => this.handleSearchSubmit(event)}>
              <input value={this.state.searchValue} onChange={event => this.handleSearchChange(event)} type="text" />
            </form>
          </div>
          <div id="copyright">
            © 2021 Makuwro LLC
          </div>
        </div>
      </div>
    );
  };
};

export default withRouter(Home);