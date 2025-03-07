// Navigation.jsx
import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'; // Assuming you're using Next.js

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
  
  return (
    <nav className="w-full fixed top-0 z-50">
      {/* Gradient background with opacity transition */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ 
          opacity: scrolled ? .7 : 0,
          boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      ></div>
      
      {/* Nav content */}
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white font-bold text-xl">
              YourBrand
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    scrolled 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-white hover:text-white hover:bg-black hover:bg-opacity-30'
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/booking" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    scrolled 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-white hover:text-white hover:bg-black hover:bg-opacity-30'
                  }`}
                >
                  Booking
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <button 
              type="button" 
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                scrolled 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-white hover:bg-black hover:bg-opacity-30'
              } focus:outline-none`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu Icon */}
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className={`relative z-10 px-2 pt-2 pb-3 space-y-1 sm:px-3 ${
          scrolled 
            ? 'bg-gray-800' 
            : 'bg-black bg-opacity-70'
        }`}>
          <Link 
            href="/" 
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/booking" 
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
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