import { createContext } from 'react';
import type { User, UserRole, LocationType } from '../types';

export interface AuthContextType {
  user: User | null;
  role: UserRole;
  currentLocation: LocationType;
  setCurrentLocation: (loc: LocationType) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isDemoMode: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
