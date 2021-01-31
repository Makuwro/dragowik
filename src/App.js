import React from "react";
import {Helmet} from "react-helmet";
import "./styles/navigation.css";
import Header from "./comps/Header";
import Article from "./comps/Article";
import Outline from "./comps/Outline";
import UserRegistration from "./comps/UserRegistration";
import UserLogin from "./comps/UserLogin";
import Editor from "./comps/Editor";
import {Switch, Route, BrowserRouter as Router} from "react-router-dom";

class App extends React.Component {
  
  headers = [
              ["h1","Description"],
              ["h2","Role in the story"],
              ["div","<b>Dream</b> is the main antagonist of The Showrunners. He is a major character of <a href=\"/wiki/article/Book-3\">Books 3</a> and <a href=\"/wiki/article/Book-4\">4</a>."],
              ["h2","Physical description"],
              ["h3","Book 1: Trust and Safety"],
              ["h3","Book 2: The Worldender"],
              ["h3","Book 3: Now in Color"],
              ["h3","Book 4: Teamwork vs. Dream's Work"],
              ["h1","Biography"],
              ["h2","Before Book 1"],
              ["h2","Book 1: Trust and Safety"],
              ["h2","Book 2: The Worldender"],
              ["h2","Book 3: Now in Color"],
              ["h2","Book 4: Teamwork vs. Dream's Work"]
            ];
  
  constructor(props) {
    super(props);
  };
  
  render() {
    return (
      <div id="app">
        <Router>
          <Switch>
            <Route exact path="/wiki/article/:name/edit">
              <Helmet>
                <title>Editing Dream - The Showrunners Wiki</title>
              </Helmet>
              <Editor content={this.headers} />
            </Route>
            
            <Route exact path="/wiki/article/Dream">
              <Helmet>
                <title>Dream - The Showrunners Wiki</title>
              </Helmet>
              <Header wikiName="The Showrunners Wiki" />
              <Outline articleName="Dream" headers={this.headers} />
              <Article articleName="Dream" content={this.headers} />
            </Route>
            
            <Route path="/wiki/article/Book-3">
              <Helmet>
                <title>Book 3 - The Showrunners Wiki</title>
              </Helmet>
              <Header wikiName="The Showrunners Wiki" />
              <Outline articleName="Book 3" headers={this.headers} />
              <Article articleName="Book 3" content={this.headers} />
            </Route>
            
            <Route exact path="/wiki/register">
              <Helmet>
                <title>Sign up to contribute to The Showrunners Wiki</title>
              </Helmet>
              <Header wikiName="The Showrunners Wiki" />
              <UserRegistration />
            </Route>
            
            <Route exact path="/wiki/login">
              <Helmet>
                <title>Welcome back to The Showrunners Wiki</title>
              </Helmet>
              <Header wikiName="The Showrunners Wiki" />
              <UserLogin />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  };
};

export default App;