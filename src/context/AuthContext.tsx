import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Team } from '../types';
import { StorageService } from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  assignedTeams: Team[];
  activeTeam: Team | null;
  setActiveTeam: (team: Team | null) => void;
  login: (email: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
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
    const savedUserId = currentUserId || localStorage.getItem('mj_current_user_id');
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

    // Default to admin on first load for easy demonstration
    const defaultAdmin = allUsers.find((u) => u.role === 'admin') || allUsers[0];
    if (defaultAdmin) {
      setUser(defaultAdmin);
      localStorage.setItem('mj_current_user_id', defaultAdmin.id);
      const teams = StorageService.getUserTeams(defaultAdmin.id);
      setAssignedTeams(teams);
      setActiveTeam(teams.length > 0 ? teams[0] : null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const login = (email: string): boolean => {
    const found = StorageService.getUserByEmail(email);
    if (!found) return false;

    setUser(found);
    localStorage.setItem('mj_current_user_id', found.id);
    const teams = StorageService.getUserTeams(found.id);
    setAssignedTeams(teams);
    setActiveTeam(teams.length > 0 ? teams[0] : null);
    return true;
  };

  const logout = () => {
    setUser(null);
    setAssignedTeams([]);
    setActiveTeam(null);
    localStorage.removeItem('mj_current_user_id');
  };

  const switchUser = (userId: string) => {
    loadUserData(userId);
  };

  const refreshUserData = () => {
    if (user) {
      loadUserData(user.id);
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
        switchUser,
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
