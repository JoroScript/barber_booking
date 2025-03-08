// Navigation.jsx
import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'; // Assuming you're using Next.js
import "./styles/animations.css";
import "./styles/navigation.css";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);
  
  // Handle scroll event to change navigation background
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10; // Adjust this value as needed
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  // Trigger animation on component mount
  useEffect(() => {
    // Small delay to ensure animation happens after render
    const timer = setTimeout(() => {
      setAnimateItems(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <nav className={`w-full fixed top-0 z-50 transition-all duration-300 ${scrolled ? 'nav-scrolled' : 'nav-transparent'}`}>
      {/* Gradient background with opacity transition */}
      <div 
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          background: scrolled ? 'linear-gradient(to bottom, #000000, #111111)' : 'transparent',
          boxShadow: scrolled ? '0 4px 10px rgba(0, 0, 0, 0.5)' : 'none'
        }}
      ></div>
      
      {/* Nav content */}
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand with slide-in animation */}
          <div 
            className={`flex-shrink-0 transition-all duration-700 ease-out ${
              animateItems ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <Link to="/" className="text-white font-bold text-xl relative group">
              TheBorzz
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
          
          {/* Desktop Navigation with staggered fade-in */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              <li 
                className={`transition-all duration-700 delay-100 ease-out ${
                  animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
              >
                <Link 
                  to="/" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-gray-300 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10">Home</span>
                  <span className="absolute bottom-0 left-0 w-full h-0 bg-white bg-opacity-20 transition-all duration-300 group-hover:h-full"></span>
                </Link>
              </li>
              <li 
                className={`transition-all duration-700 delay-200 ease-out ${
                  animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
              >
                <Link 
                  to="/booking" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-gray-300 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10">Booking</span>
                  <span className="absolute bottom-0 left-0 w-full h-0 bg-white bg-opacity-20 transition-all duration-300 group-hover:h-full"></span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Mobile Navigation Button */}
          <div 
            className={`md:hidden transition-all duration-700 delay-300 ease-out ${
              animateItems ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 hover:bg-black hover:bg-opacity-30 focus:outline-none transition-transform duration-300 hover:scale-110"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="w-6 h-6 relative">
                <span 
                  className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? 'rotate-45 top-3' : 'rotate-0 top-1'
                  }`}
                ></span>
                <span 
                  className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out top-3 ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                ></span>
                <span 
                  className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? '-rotate-45 top-3' : 'rotate-0 top-5'
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`relative z-10 px-2 pt-2 pb-3 space-y-1 sm:px-3 mobile-menu ${
          scrolled ? 'bg-black' : 'bg-black bg-opacity-95'
        }`}>
          <Link 
            to="/" 
            className="text-white hover:text-gray-300 block px-3 py-2 rounded-md text-base font-medium hover:bg-white hover:bg-opacity-10 transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/booking" 
            className="text-white hover:text-gray-300 block px-3 py-2 rounded-md text-base font-medium hover:bg-white hover:bg-opacity-10 transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Booking
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;