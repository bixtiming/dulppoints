import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Gamepad2, 
  Users, 
  Wallet, 
  User, 
  LogOut, 
  Menu, 
  X,
  Trophy,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { balance } = useWallet();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      // Silent fail for logout
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Games', path: '/games', icon: Gamepad2 },
    { name: 'GamePlay', path: '/gameplay', icon: Trophy },
    { name: 'Referrals', path: '/referrals', icon: Users },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-crypto-dark/80 backdrop-blur-md border-b border-crypto-neon/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-crypto-neon to-crypto-purple rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <Link to="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-crypto-neon to-crypto-purple bg-clip-text text-transparent whitespace-nowrap">
              DulpPoints
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className="flex items-center space-x-2 text-gray-300 hover:text-crypto-neon transition-colors duration-200"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser ? (
              <>
                {/* Balance Display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:flex items-center space-x-2 bg-crypto-neon/20 px-3 py-2 rounded-lg border border-crypto-neon/30"
                >
                  <Zap className="w-4 h-4 text-crypto-neon" />
                  <span className="text-crypto-neon font-semibold">{balance.toLocaleString()}</span>
                </motion.div>

                {/* User Menu */}
                <div className="relative min-w-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 rounded-lg text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block truncate max-w-[30vw]">{currentUser.email?.split('@')[0]}</span>
                  </motion.button>

                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-crypto-dark border border-crypto-neon/20 rounded-lg shadow-xl py-2"
                    >
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-gray-300 hover:bg-crypto-neon/10 hover:text-crypto-neon transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-crypto-neon/10 hover:text-crypto-neon transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-crypto-neon transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-crypto-neon transition-colors duration-200"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-crypto-neon/20 py-4"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center space-x-3 text-gray-300 hover:text-crypto-neon transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-crypto-neon/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {currentUser && (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-3 text-gray-300 hover:text-crypto-neon transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-crypto-neon/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;