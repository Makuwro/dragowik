import React from "react";
import {Helmet} from "react-helmet";
import "./styles/navigation.css";
import Header from "./comps/Header";
import Article from "./comps/Article";
import Outline from "./comps/Outline";

class App extends React.Component {
  
  constructor(props) {
    super(props);
  };
  
  render() {
    return (
      <div className="App">
        <Helmet>
          <title>Dream - The Showrunners Wiki</title>
        </Helmet>
        <Header wikiName="The Showrunners Wiki" />
        <Outline articleName="Dream" />
        <Article articleName="Dream" />
      </div>
    );
  };
};

export default App;