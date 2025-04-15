import React from 'react';
import { UserProvider } from '../contexts/UserContext';
import UserProfile from '../components/UserProfile';
const Home: React.FC = () => {

    return(    
        <div>
            <h1>Home</h1>
        <UserProvider>
            <UserProfile />
        </UserProvider>
      </div>
      )
}
export default Home;