// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './Components/Dashboard/Dashboard';
import Sidepanel from './Components/Sidepanel/Sidepanel';
import BlockedWebsites from './Components/BlockedWebsites/BlockedWebsites';

function App() {
  return (
    <div className="App">
      <Router>
        <Sidepanel />
        <Routes>
          <Route path="/blocked-websites" element={<BlockedWebsites />} />
          <Route path="/index.html" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

