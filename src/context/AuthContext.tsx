import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Team } from '../types';
import { StorageService } from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  assignedTeams: Team[];
  activeTeam: Team | null;
  setActiveTeam: (team: Team | null) => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  refreshUserData: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [assignedTeams, setAssignedTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = (currentUserId?: string) => {
    const savedUserId = currentUserId || localStorage.getItem('mj_current_user_prod_v2');
    const allUsers = StorageService.getUsers();

    if (savedUserId) {
      const found = allUsers.find((u) => u.id === savedUserId);
      if (found) {
        setUser(found);
        const teams = StorageService.getUserTeams(found.id);
        setAssignedTeams(teams);
        setActiveTeam(teams.length > 0 ? teams[0] : null);
        setIsLoading(false);
        return;
      }
    }

    // Default to admin session if no active session yet
    const adminUser = allUsers.find((u) => u.role === 'admin') || allUsers[0];
    if (adminUser) {
      setUser(adminUser);
      localStorage.setItem('mj_current_user_prod_v2', adminUser.id);
      const teams = StorageService.getUserTeams(adminUser.id);
      setAssignedTeams(teams);
      setActiveTeam(teams.length > 0 ? teams[0] : null);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const login = (email: string, password = ''): boolean => {
    const found = StorageService.getUserByEmail(email);
    if (!found) return false;

    if (password && !StorageService.verifyPassword(email, password)) {
      return false;
    }

    setUser(found);
    localStorage.setItem('mj_current_user_prod_v2', found.id);
    const teams = StorageService.getUserTeams(found.id);
    setAssignedTeams(teams);
    setActiveTeam(teams.length > 0 ? teams[0] : null);
    return true;
  };

  const logout = () => {
    setUser(null);
    setAssignedTeams([]);
    setActiveTeam(null);
    localStorage.removeItem('mj_current_user_prod_v2');
  };

  const refreshUserData = () => {
    if (user) {
      loadUserData(user.id);
    } else {
      loadUserData();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        assignedTeams,
        activeTeam,
        setActiveTeam,
        login,
        logout,
        refreshUserData,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
