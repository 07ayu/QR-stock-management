import React, { useState, useEffect } from 'react';
import type { User, UserRole, LocationType } from '../types';
import { DEMO_USERS } from '../services/mockData';
import { AuthContext } from './authContextDefinition';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sm_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS[0];
      }
    }
    return DEMO_USERS[0];
  });

  const [currentLocation, setCurrentLocation] = useState<LocationType>('store');
  const isDemoMode = true; // Backend auth endpoints pending

  useEffect(() => {
    if (user) {
      localStorage.setItem('sm_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sm_current_user');
    }
  }, [user]);

  const switchRole = (newRole: UserRole) => {
    const target = DEMO_USERS.find(u => u.role === newRole) || {
      id: `usr_${newRole}`,
      name: newRole === 'admin' ? 'Admin User' : 'Store Employee',
      email: `${newRole}@stockmgmt.local`,
      role: newRole,
      defaultLocation: 'store'
    };
    setUser(target);
  };

  const login = async (email: string, preferredRole: UserRole = 'admin'): Promise<boolean> => {
    const matched = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: preferredRole,
      defaultLocation: 'store'
    };
    setUser(matched);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'employee',
        currentLocation,
        setCurrentLocation,
        switchRole,
        login,
        logout,
        isDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
