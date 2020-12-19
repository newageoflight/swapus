import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

import { Navbar } from './components/layout/Navigation';
import { About } from './components/pages/About';
import { Frontpage } from './components/pages/Frontpage';
import { Groups } from './components/pages/Groups';
import { AddGroup } from './components/pages/AddGroup';
import { Login } from './components/pages/Login';

import "./css/App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Route exact path="/" component={Frontpage} />
          <Route path="/groups" component={Groups} />
          <Route path="/about" component={About} />
          <Route path="/add_group" component={AddGroup} />
          <Route path="/login" component={Login} />
        </div>
      </div>
    </Router>
  );
}

export default App;
