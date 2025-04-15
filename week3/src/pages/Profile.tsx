import React from 'react';
import { useParams } from 'react-router-dom';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return <h1>Welcome, {username}!</h1>;
};

export default Profile;