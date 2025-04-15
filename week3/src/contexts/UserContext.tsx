import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context data
interface User {
  name: string;
  age: number;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Create a provider component
interface UserProviderProps {
    children: ReactNode;
}

// Create the context with a default value of undefined
export const UserContext = createContext<UserContextType | undefined>(undefined);

//const genericContext = createContext(undefined);


export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};



// Custom hook to use the UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};