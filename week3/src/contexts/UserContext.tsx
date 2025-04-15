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
  previousLogins: User[];
  addPreviousLogin: (user: User) => void;
}

// Create a provider component
interface UserProviderProps {
    children: ReactNode;
}

// Create the context with a default value of undefined
export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [previousLogins, setPreviousLogins] = useState<User[]>([]);

    const addPreviousLogin = (user: User) => {
        setPreviousLogins((prev) => [...prev, user]);
    };

    return (
        <UserContext.Provider value={{ user, setUser, previousLogins, addPreviousLogin }}>
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