// Dependencies
import React, {useEffect, useState} from "react";
import {Helmet, HelmetProvider} from "react-helmet-async";
import {Switch, Route, BrowserRouter as Router, useParams, Redirect, useLocation} from "react-router-dom";

// Styles
import "./styles/navigation.css";

// Makuwki components
import Header from "./comps/Header";
import Article from "./comps/Article";
import UserRegistration from "./comps/UserRegistration";
import UserLogin from "./comps/UserLogin";
import SourceEditor from "./comps/SourceEditor";
import Home from "./comps/Home";


function getArticleName(name, edit) {
  const FrontBackRegex = /[^_*]\w+[^_*]/g;
  const FrontBackMatch = name.match(FrontBackRegex);
  
  if (name.includes(" ")) {
    // Prevent possible double redirect
    var underscoredName = name.replace(" ", "_").match(FrontBackRegex)[0];
    return <Redirect to={"/wiki/article/" + underscoredName + (edit ? "/edit" : "")} />;
  } else if (FrontBackMatch && name !== name.match(FrontBackRegex)[0]) {
    return <Redirect to={"/wiki/article/" + name.match(FrontBackRegex)[0] + (edit ? "/edit" : "")} />;
  };
  var displayName = name.replace("_", " ");
  return displayName;
};
/*
function VerifyEditor() {
  var displayName = getArticleName(useParams, true);
  return <div><Helmet><title>{"Editing " + displayName + " - The Showrunners Wiki"}</title></Helmet><Editor articleName={displayName} content={headers[displayName]} /></div>
};
*/
function App() {
  
  const [article, setArticle] = useState(null);
  const [articleMode, setArticleMode] = useState(null);
  const [articleName, setArticleName] = useState(null);
  const [location, setLocation] = useState(null);
  const [redirect, setRedirect] = useState(null);
  
  function VerifyArticle(props) {
    const {name} = useParams();
    const location = useLocation();
    const Query = new URLSearchParams(location.search);
    const Mode = props.editMode ? Query.get("mode") : undefined;
    const Redirect = Query.get("redirect") === "no" ? false : true;
    
    useEffect(() => {
      setArticleName(name);
      setArticleMode(props.editMode ? (Mode && Mode.toLowerCase() === "source" ? Mode : "visual") : "view");
      setRedirect(Redirect);
    });
    
    return "";
  };
  
  useEffect(() => {
    async function updateArticle() {
      
      if (articleMode) {
        
        var name = articleName;
        var displayName = getArticleName(name);
        
        if (typeof(displayName) !== "string") {
          setArticle(displayName);
          return;
        };
        
        var articleInfo;
        
        try {
          const Response = await fetch("/api/article/" + name);
          const JSONResponse = await Response.json();
          
          if (!Response.ok) {
            switch (Response.status) {
              
              case 404: 
                throw new Error("Article doesn't exist");
                
              default:
                throw new Error("Unknown error");
              
            };
          };
          
          articleInfo = JSONResponse;
        } catch (err) {
          console.warn("Couldn't get article data for " + name + ": " + err);
        };
   
        switch (articleMode) {
          
          case "view":
            return setArticle(
              <div>
                <Helmet>
                  <title>{
                    displayName + " - The Showrunners Wiki"
                  }</title>
                </Helmet>
                <Header wikiName="The Showrunners Wiki" />
                <Article articleName={displayName} redirect={redirect} specialName={name} exists={articleInfo ? true : false} source={articleInfo ? articleInfo.source : undefined} />
              </div>
            );
          
          case "source":
            return setArticle(
              <div>
                <Helmet>
                  <title>{
                    "Editing the source of " + displayName + " - The Showrunners Wiki"
                  }</title>
                </Helmet>
                <SourceEditor articleName={displayName} specialName={name} source={articleInfo ? articleInfo.source : undefined} />
              </div>
            );
            
          case "visual":
            return setArticle("Visual mode soon!");
            
          default: 
            return setArticle("Unknown article mode");
            
        };
      };
    };
    
    updateArticle();
  }, [articleName, articleMode]);
  
  return (
    <HelmetProvider>
      <div id="app">
        <Router>
          <Switch>
            <Route exact path="/wiki/article/:name/edit">
              <VerifyArticle editMode={true} />{article}
            </Route>
            
            <Route exact path="/wiki/article/:name">
              <VerifyArticle />{article}
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

export default App;