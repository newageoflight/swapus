import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect, useHistory } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from 'recoil';
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
import { LoggedIn } from './context/LoggedIn';
import { Frontpage } from './components/pages/Frontpage';
import { Profile } from './components/pages/Profile';
import { ProfileReadOnly } from './components/pages/ProfileReadOnly';
import { GroupList } from './context/GroupList';
import { callProtectedEndpoint } from './utils/HTTPHandlers';
import { GroupInterface } from './interfaces/GroupInterface';
import { useResetRecoilState } from 'recoil';

function App() {
  // check if we have a valid token stored in localstorage first
  // if not, clear it and redirect to the login page
  const history = useHistory();
  const loggedIn = useRecoilValue(LoggedIn);
  const resetLoggedIn = useResetRecoilState(LoggedIn);
  const setGroupList = useSetRecoilState(GroupList);

    useEffect(() => {
        async function getGroups() {
            let userGroups = await callProtectedEndpoint(`/api/v1/graph/usergroups`, loggedIn.token.access_token, history, resetLoggedIn)
            let dataToSet = (userGroups as GroupInterface[] || [] as GroupInterface[])
            setGroupList(dataToSet);
        }
        console.log(loggedIn)
        if (!!loggedIn.token.access_token)
          getGroups()
        // eslint-disable-next-line
    }, [loggedIn])

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
          <ProtectedRoute {...defaultProtectedRouteProps} path="/add_group" component={AddGroup} />
          <ProtectedRoute {...defaultProtectedRouteProps} exact path="/profile" component={Profile} />
          <ProtectedRoute {...defaultProtectedRouteProps} exact path="/profile/:username" component={ProfileReadOnly} />
          <Route path="/about" component={About} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </div>
      </div>
    </Router>
  );
}

export default App;
