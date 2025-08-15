
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, UserTier } from '../types';
import { GUEST_SCAN_LIMIT, FREE_TIER_DAILY_LIMIT } from '../constants';

interface AuthContextType {
  user: User;
  login: (tier: UserTier) => void;
  logout: () => void;
  signup: () => void;
  decrementScanCount: () => boolean;
  decrementAiCredits: (count: number) => void;
  getRemainingScans: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialGuestUser: User = {
  id: null,
  tier: UserTier.GUEST,
  scansToday: 0,
  totalGuestScans: 0,
  aiCredits: 0,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(initialGuestUser);

  const login = (tier: UserTier) => {
    if (tier === UserTier.FREE) {
      setUser({
        id: 'user-free-123',
        email: 'free-user@example.com',
        tier: UserTier.FREE,
        scansToday: 0,
        totalGuestScans: user.totalGuestScans,
        aiCredits: 0,
      });
    } else if (tier === UserTier.PAID) {
      setUser({
        id: 'user-paid-456',
        email: 'pro-user@example.com',
        tier: UserTier.PAID,
        scansToday: 0,
        totalGuestScans: user.totalGuestScans,
        aiCredits: 100,
      });
    }
  };

  const logout = () => {
    setUser(initialGuestUser);
  };

  const signup = () => {
    // In a real app, this would involve a registration flow.
    // Here, we'll just log them in as a free user.
    login(UserTier.FREE);
  };

  const getRemainingScans = useCallback((): number => {
    if (user.tier === UserTier.GUEST) {
      return Math.max(0, GUEST_SCAN_LIMIT - user.totalGuestScans);
    }
    if (user.tier === UserTier.FREE) {
      return Math.max(0, FREE_TIER_DAILY_LIMIT - user.scansToday);
    }
    return Infinity; // Paid users have unlimited basic scans
  }, [user]);


  const decrementScanCount = useCallback((): boolean => {
    if (getRemainingScans() <= 0) {
      return false; // No scans left
    }

    setUser(currentUser => {
      if (currentUser.tier === UserTier.GUEST) {
        return { ...currentUser, totalGuestScans: currentUser.totalGuestScans + 1 };
      }
      if (currentUser.tier === UserTier.FREE) {
        return { ...currentUser, scansToday: currentUser.scansToday + 1 };
      }
      return currentUser;
    });

    return true; // Scan was successful
  }, [getRemainingScans]);

  const decrementAiCredits = useCallback((count: number) => {
    setUser(currentUser => {
      if (currentUser.tier === UserTier.PAID && currentUser.aiCredits > 0) {
        return { ...currentUser, aiCredits: Math.max(0, currentUser.aiCredits - count) };
      }
      return currentUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, decrementScanCount, decrementAiCredits, getRemainingScans }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
