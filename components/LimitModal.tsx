
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserTier } from '../types';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: UserTier;
}

const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose, userTier }) => {
  const { signup, login } = useAuth();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    login(UserTier.PAID);
    onClose();
  };

  const handleSignup = () => {
    signup();
    onClose();
  };

  const handleBuyCredits = () => {
    // In a real app, this would open a payment modal or redirect.
    alert("This would redirect to a page to purchase more credits.");
    onClose();
  };

  let title, message, primaryActionText;
  let primaryActionHandler: () => void;

  if (userTier === UserTier.PAID) {
    title = "You're Out of AI Credits";
    message = "Purchase more AI Credits to continue receiving full, AI-powered image analyses.";
    primaryActionText = "Buy More Credits";
    primaryActionHandler = handleBuyCredits;
  } else {
    const isGuest = userTier === UserTier.GUEST;
    title = isGuest ? "You've Used Your Free Scans" : "Daily Limit Reached";
    message = isGuest
      ? "Sign up for a free account to get 3 more basic scans every day and save your history."
      : "You've used your 3 basic scans for today. Upgrade to Pro for AI-powered analysis!";
    primaryActionText = isGuest ? "Sign Up for Free" : "Upgrade to Pro";
    primaryActionHandler = isGuest ? handleSignup : handleUpgrade;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900">
          <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mt-4">{title}</h3>
        <div className="mt-2 px-2 py-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </div>
        <div className="mt-5 sm:mt-6 space-y-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={primaryActionHandler}
          >
            {primaryActionText}
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onClose}
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitModal;
