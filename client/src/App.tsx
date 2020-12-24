import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import "./css/App.css"

import { Navbar } from './components/layout/Navigation';
import { About } from './components/pages/About';
import { Dashboard } from './components/pages/Dashboard';
import { Groups } from './components/pages/Groups';
import { AddGroup } from './components/pages/AddGroup';
import { Login } from './components/pages/Login';
import { Register } from './components/pages/Register';
import { GroupPage } from './components/pages/GroupPage';
import { ProtectedRoute, ProtectedRouteProps } from './components/ProtectedRoute';
import { useRecoilState } from 'recoil';
import { LoggedIn } from './context/LoggedIn';
import { Frontpage } from './components/pages/Frontpage';
import { Profile } from './components/pages/Profile';

function App() {
  // check if we have a valid token stored in localstorage first
  // if not, clear it and redirect to the login page
  const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);

  // TODO: make one landing page for people who aren't logged in and another for people who are
  const defaultProtectedRouteProps: ProtectedRouteProps = {
    isAuthenticated: !!loggedIn.token.access_token,
    authenticationPath: "/login",
    isAllowed: true,
    restrictedPath: "/"
  }

  // https://stackoverflow.com/questions/47747754/how-to-rewrite-the-protected-private-route-using-typescript-and-react-router-4-a
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Route exact path='/'>
            {!!loggedIn.token.access_token ? <Redirect to="/dashboard" /> : <Frontpage />}
          </Route>
          <ProtectedRoute {...defaultProtectedRouteProps} exact path="/dashboard" component={Dashboard} />
          <ProtectedRoute {...defaultProtectedRouteProps} exact path="/groups" component={Groups} />
          <ProtectedRoute {...defaultProtectedRouteProps} exact path="/groups/:id" component={GroupPage} />
          <ProtectedRoute {...defaultProtectedRouteProps} path="/about" component={About} />
          <ProtectedRoute {...defaultProtectedRouteProps} path="/add_group" component={AddGroup} />
          <ProtectedRoute {...defaultProtectedRouteProps} path="/profile" component={Profile} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </div>
      </div>
    </Router>
  );
}

export default App;
