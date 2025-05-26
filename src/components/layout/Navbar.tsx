import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, LogOut, User, Menu, X, Search, CreditCard, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Court Picker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Venues
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              <Search size={20} className="inline-block mr-1" /> Search
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              <CreditCard size={20} className="inline-block mr-1" /> Pricing
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-6">
                <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  <Settings size={20} className="inline-block mr-1" /> Admin
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  <User size={20} className="inline-block mr-1" /> Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <LogOut size={20} className="inline-block mr-1" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link to="/" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                Venues
              </Link>
              <Link to="/search" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                <Search size={20} className="inline-block mr-1" /> Search
              </Link>
              <Link to="/pricing" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                <CreditCard size={20} className="inline-block mr-1" /> Pricing
              </Link>
              
              {user ? (
                <>
                  <Link to="/admin" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                    <Settings size={20} className="inline-block mr-1" /> Admin
                  </Link>
                  <Link to="/profile" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                    <User size={20} className="inline-block mr-1" /> Profile
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left py-2 text-gray-700 hover:text-blue-600 font-medium"
                  >
                    <LogOut size={20} className="inline-block mr-1" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                  <Link to="/login" className="block py-2 text-center text-gray-700 hover:text-blue-600 font-medium">
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="block py-2 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}