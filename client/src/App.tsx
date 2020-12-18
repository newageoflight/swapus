import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Navbar } from './components/layout/Navigation';
import { About } from './components/pages/About';
import { Frontpage } from './components/pages/Frontpage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Route exact path="/" component={Frontpage} />
          <Route path="/about" component={About} />
        </div>
      </div>
    </Router>
  );
}

export default App;
