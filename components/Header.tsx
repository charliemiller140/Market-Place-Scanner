
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserTier } from '../types';
import { FREE_TIER_DAILY_LIMIT, GUEST_SCAN_LIMIT } from '../constants';

const Header: React.FC = () => {
  const { user, login, logout, signup, getRemainingScans } = useAuth();

  const renderUserStatus = () => {
    const remainingScans = getRemainingScans();
    switch (user.tier) {
      case UserTier.GUEST:
        return (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {remainingScans}/{GUEST_SCAN_LIMIT} Free Scans Left
            </span>
             <button
              onClick={signup}
              className="px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              Sign Up
            </button>
            <button
              onClick={() => login(UserTier.FREE)}
              className="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Log In
            </button>
          </div>
        );
      case UserTier.FREE:
        return (
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              Scans Remaining: <strong>{remainingScans}/{FREE_TIER_DAILY_LIMIT}</strong>
            </span>
            <button onClick={() => login(UserTier.PAID)} className="px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-500 transition-colors">
              Upgrade to Pro
            </button>
            <button onClick={logout} className="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Log Out
            </button>
          </div>
        );
      case UserTier.PAID:
        return (
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-yellow-500 dark:text-yellow-400 font-semibold">
              AI Credits: {user.aiCredits}
            </span>
            <span className="text-green-600 dark:text-green-400 font-semibold">Pro Account</span>
            <button onClick={logout} className="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Log Out
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Image Analyzer</span>
          </div>
          <div>{renderUserStatus()}</div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
