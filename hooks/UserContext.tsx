import React, { createContext, ReactNode, useContext, useState } from 'react';

export type User = {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string | null;
};

export type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // For development/testing, provide a default user
  const [user, setUser] = useState<User | null>({
    id: 'alvinn',
    username: 'alvinn',
    name: 'Alvin',
    bio: 'Basketball, Fragrance, Cars',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  });

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}; 