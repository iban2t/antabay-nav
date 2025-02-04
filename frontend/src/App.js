import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import Navigation from './Navigation';
import Contacts from './Contacts';
import FreqLoc from './FreqLoc';
import Distress from './Distress';
import Reports from './Reports'
import Zones from './Zones';
import Users from './Users';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/navigation/" element={<Navigation />} />
        <Route path="/dashboard/" element={<Dashboard />} />
        <Route path="/contacts/" element={<Contacts />} />
        <Route path="/freqloc/" element={<FreqLoc />} />
        <Route path="/distress/" element={<Distress />} />
        <Route path="/reports/" element={<Reports />} />
        <Route path="/zones/" element={<Zones />} />
        <Route path="/users/" element={<Users />} />
      </Routes>
    </Router>
  );
}

export default App;
