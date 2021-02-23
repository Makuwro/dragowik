// Dependencies
import React, {useEffect, useState} from "react";
import {Helmet, HelmetProvider} from "react-helmet-async";
import {Switch, Route, BrowserRouter as Router, useParams, Redirect, useLocation} from "react-router-dom";

// Makuwki components
import Header from "./comps/Header";
import Article from "./comps/Article";
import UserRegistration from "./comps/UserRegistration";
import UserLogin from "./comps/UserLogin";
import User from "./comps/User";
import SourceEditor from "./comps/SourceEditor";
import Home from "./comps/Home";


function getArticleName(name, edit) {
  const FrontBackRegex = /[^_*][^ ]+[^_*]/g;
  const FrontBackMatch = name.match(FrontBackRegex);
  
  if (name.includes(" ")) {
    // Prevent possible double redirect
    var underscoredName = name.replaceAll(" ", "_").match(FrontBackRegex)[0];
    return <Redirect to={"/wiki/article/" + underscoredName + (edit ? "/edit" : "")} />;
  } else if (FrontBackMatch && name !== name.match(FrontBackRegex)[0]) {
    return <Redirect to={"/wiki/article/" + name.match(FrontBackRegex)[0] + (edit ? "/edit" : "")} />;
  };
  var displayName = name.replaceAll("_", " ");
  return displayName;
};
/*
function VerifyEditor() {
  var displayName = getArticleName(useParams, true);
  return <div><Helmet><title>{"Editing " + displayName + " - The Showrunners Wiki"}</title></Helmet><Editor articleName={displayName} content={headers[displayName]} /></div>
};
*/
function App() {
  
  const [mode, setMode] = useState(null);
  const [article, setArticle] = useState(null);
  const [articleMode, setArticleMode] = useState(null);
  const [articleName, setArticleName] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  
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
      setMode(1);
    });
    
    return null;
  };
  
  function VerifyUser(props) {
    const {username} = useParams();
    
    useEffect(() => {
      setUsername(username);
      setMode(2);
    });
    
    return null;
  };
  
  useEffect(() => {
    
    switch (mode) {
      
      case 1:
        
        async function updateArticle() {
          
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
            
            case "visual":
            case "view":
              document.title = displayName + " - The Showrunners Wiki";
              
              if (articleInfo) {
                const ContributorIds = JSON.parse(articleInfo.contributors);
                var contributorInfo = []
                for (var i = 0; ContributorIds.length > i; i++) {
                  var userInfoResponse = await fetch("/api/user?id=" + ContributorIds[i]);
                  var userInfo = await userInfoResponse.json();
                  contributorInfo.push(userInfo);
                };
                articleInfo.contributors = contributorInfo;
              };
              
              return setArticle(
                <>
                  <Header wikiName="The Showrunners Wiki" />
                  <Article articleName={displayName} redirect={redirect} specialName={name} exists={articleInfo ? true : false} source={articleInfo ? articleInfo.source : undefined} timestamp={articleInfo ? articleInfo.lastUpdated : undefined} contributors={articleInfo ? articleInfo.contributors : undefined} edit={articleMode === "visual" ? true : false} />
                </>
              );
            
            case "source":
              document.title = "Editing the source of " + displayName + " - The Showrunners Wiki";
              return setArticle(
                <>
                  <Header wikiName="The Showrunners Wiki" />
                  <SourceEditor articleName={displayName} specialName={name} source={articleInfo ? articleInfo.source : undefined} />
                </>
              );
              
            default: 
              return setArticle("Unknown article mode");
              
          };
        };
        
        updateArticle();
        break;
        
      case 2:
        setUser(
          <>
            <Header wikiName="The Showrunners Wiki" />
            <User username={username} />
          </>
        );
        break;
        
      default:
        break;
      
    };
    
  }, [articleName, articleMode, redirect, mode, username]);
  
  return (
    <HelmetProvider>
      <>
        <Router>
          <Switch>
            <Route exact path="/wiki/article/:name/edit">
              <VerifyArticle editMode={true} />{article}
            </Route>
            
            <Route exact path="/wiki/article/:name">
              <VerifyArticle />{article}
            </Route>
            
            <Route exact path="/wiki/user/:username">
              <VerifyUser />{user}
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
            
            <Route exact path={["/wiki", "/wiki/article", "/wiki/user"]}>
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
      </>
    </HelmetProvider>
  );
  
};

export default App;