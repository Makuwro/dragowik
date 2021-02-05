import React from "react";
import {Helmet, HelmetProvider} from "react-helmet-async";
import "./styles/navigation.css";
import Header from "./comps/Header";
import Article from "./comps/Article";
import Outline from "./comps/Outline";
import UserRegistration from "./comps/UserRegistration";
import UserLogin from "./comps/UserLogin";
import Editor from "./comps/Editor";
import Home from "./comps/Home";
import {Switch, Route, BrowserRouter as Router, useParams, Redirect} from "react-router-dom";

const headers = {
  "Dream": [
    ["h1","Description"],
    ["h2","Role in the story"],
    ["div","<b>Dream</b> is the main antagonist of The Showrunners. He is a major character of <a href=\"/wiki/article/Book_3\">Books 3</a> and <a href=\"/wiki/article/Book_4\">4</a>."],
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
  ], "Lithicus": [
    ["div","#REDIRECT [[Lithicus_Drakarox]]"]
  ]
};

function getArticleName(upFunc, edit) {
  var {name} = upFunc();
  const FrontBackRegex = /[^_*]\w+[^_*]/g;
  if (name.includes(" ")) {
    // Prevent possible double redirect
    var underscoredName = name.replace(" ", "_").match(FrontBackRegex)[0];
    return <Redirect to={"/wiki/article/" + underscoredName + (edit ? "/edit" : "")} />;
  } else if (name !== name.match(FrontBackRegex)[0]) {
    return <Redirect to={"/wiki/article/" + name.match(FrontBackRegex)[0] + (edit ? "/edit" : "")} />;
  };
  var displayName = name.replace("_", " ");
  return displayName;
};

function VerifyArticle() {
  var displayName = getArticleName(useParams);
  return <div><Helmet><title>{displayName + " - The Showrunners Wiki"}</title></Helmet><Header wikiName="The Showrunners Wiki" /><Outline exists={headers[displayName] ? true : false} articleName={displayName} headers={headers[displayName]} /><Article articleName={displayName} exists={headers[displayName] ? true : false} content={headers[displayName]} /></div>
};

function VerifyEditor() {
  var displayName = getArticleName(useParams, true);
  return <div><Helmet><title>{"Editing " + displayName + " - The Showrunners Wiki"}</title></Helmet><Editor articleName={displayName} content={headers[displayName]} /></div>
};

class App extends React.Component {
  
  constructor(props) {
    super(props);
  };
  
  render() {
    return (
      <HelmetProvider>
        <div id="app">
          <Router>
            <Switch>
              <Route exact path="/wiki/article/:name/edit">
                <VerifyEditor />
              </Route>
              
              <Route exact path="/wiki/article/:name">
                <VerifyArticle />
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
              
              <Route exact path={["/wiki", "/wiki/article"]}>
                <Redirect to="/" />
              </Route>
              
              <Route exact path="/">
                <Helmet>
                  <title>Welcome to The Showrunners Wiki</title>
                </Helmet>
                <Home />
              </Route>
            </Switch>
          </Router>
        </div>
      </HelmetProvider>
    );
  };
};

export default App;