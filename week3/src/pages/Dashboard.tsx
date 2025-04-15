import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Profile from './Profile';
import Settings from './Settings';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <ul>
          <li>
            <Link to="profile">Profile</Link>
          </li>
          <li>
            <Link to="settings">Settings</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="profile/:username" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </div>
  );
};

export default Dashboard;