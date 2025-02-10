import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa';
import MetamaskLogin from './MetamaskLogin';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-['Orbitron'] font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-500 transition-all duration-300">
                Tor-Rent
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`${isActive('/')} hover:text-blue-500 transition-colors`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`${isActive('/about')} hover:text-blue-500 transition-colors`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`${isActive('/contact')} hover:text-blue-500 transition-colors`}
            >
              Contact
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
            </button>
          </div>

          <div className="flex items-center">
            <MetamaskLogin />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 