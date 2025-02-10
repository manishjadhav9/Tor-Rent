import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers";

const MetamaskLogin = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showLoginButton, setShowLoginButton] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check session storage for existing login
    const savedAccount = sessionStorage.getItem('account');
    const savedRole = sessionStorage.getItem('userRole');
    
    if (savedAccount && savedRole) {
      setAccount(savedAccount);
      setShowLoginButton(false);
      navigateToRole(savedRole);
    }

    // Listen for tab/window close
    window.addEventListener('beforeunload', handleTabClose);
    
    // Listen for MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleTabClose = () => {
    sessionStorage.removeItem('account');
    sessionStorage.removeItem('userRole');
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      handleLogout();
    } else if (accounts[0] !== account) {
      // Account changed, require re-login
      handleLogout();
    }
  };

  const handleLogout = () => {
    setAccount(null);
    setSelectedRole(null);
    setShowRoleSelect(false);
    setShowLoginButton(true);
    sessionStorage.removeItem('account');
    sessionStorage.removeItem('userRole');
    navigate('/');
  };

  const handleInitialLogin = () => {
    setShowLoginButton(false);
    setShowRoleSelect(true);
  };

  const connectWallet = async (role) => {
    if (!window.ethereum) {
      setError("Please install MetaMask!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      
      // Store user role and address in session storage
      sessionStorage.setItem('account', accounts[0]);
      sessionStorage.setItem('userRole', role);
      
      // Navigate to appropriate dashboard
      navigateToRole(role);
    } catch (error) {
      setError("Failed to connect wallet. Please try again.");
      console.error("Wallet connection failed:", error);
      setShowLoginButton(true);
      setShowRoleSelect(false);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRole = (role) => {
    if (role === 'landlord') {
      navigate('/landlord-dashboard');
    } else {
      navigate('/tenant-dashboard');
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    connectWallet(role);
  };

  return (
    <div className="relative">
      {error && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center">
        {showLoginButton && !account && (
          <button
            onClick={handleInitialLogin}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 
              transition-colors dark:bg-blue-700 dark:hover:bg-blue-800 shadow-md"
          >
            Login
          </button>
        )}

        {!account && showRoleSelect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-xl font-semibold text-center mb-6 dark:text-white">
                Select Your Role
              </h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => handleRoleSelect('landlord')}
                  disabled={loading}
                  className="w-full sm:w-auto bg-green-500 text-white px-8 py-3 rounded-lg 
                    hover:bg-green-600 transition-colors disabled:opacity-50 
                    disabled:cursor-not-allowed shadow-md"
                >
                  {loading && selectedRole === 'landlord' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </span>
                  ) : 'Landlord'}
                </button>
                <button
                  onClick={() => handleRoleSelect('tenant')}
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-500 text-white px-8 py-3 rounded-lg 
                    hover:bg-blue-600 transition-colors disabled:opacity-50 
                    disabled:cursor-not-allowed shadow-md"
                >
                  {loading && selectedRole === 'tenant' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </span>
                  ) : 'Tenant'}
                </button>
              </div>
            </div>
          </div>
        )}

        {account && (
          <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg shadow-md">
            <span className="text-green-500 dark:text-green-400 font-semibold">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 font-medium hover:underline"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetamaskLogin;
