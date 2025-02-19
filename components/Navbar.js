'use client'

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../app/globals.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const router = useRouter();

  const navItems = [
    { name: 'Book Ambulance', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const isActive = (path) => currentPath === path;

  const handleNavigation = (path) => {
    setCurrentPath(path);
    setIsMenuOpen(false);
    router.push(path);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/');
            }}
          >
            <span className="text-2xl">🚑</span>
            <span className="font-bold text-xl text-red-600">ReachSure</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.name === 'Book Ambulance' ? (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md 
                            font-medium hover:bg-red-700 transition-colors
                            animate-pulse"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.path}
                  href={item.path}
                  passHref
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.path);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(item.path)
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                    }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700
                         hover:text-red-600 hover:bg-red-50 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {navItems.map((item) => (
              item.name === 'Book Ambulance' ? (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full bg-red-600 text-white px-3 py-2 rounded-md 
                            font-medium hover:bg-red-700 transition-colors text-base
                            animate-pulse"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.path}
                  href={item.path}
                  passHref
                  className={`block px-3 py-2 rounded-md text-base font-medium
                    ${isActive(item.path)
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.path);
                  }}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
