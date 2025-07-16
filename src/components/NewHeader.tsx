"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaUser, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from 'react-icons/fa';

const NewHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check auth status on component mount
  useEffect(() => {
    // TODO: Replace with actual auth check
    const checkAuth = async () => {
      // Simulate checking auth status
      const isAuthenticated = false; // Replace with actual auth check
      setIsLoggedIn(isAuthenticated);
    };
    checkAuth();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-bg-secondary shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-3xl font-extrabold uppercase logo-text-gradient tracking-widest leading-none">AURA</h1>
              <span className="text-sm uppercase tracking-widest ml-1 -mb-1 text-text-secondary">Play</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/games" className="text-text-primary hover:text-accent-primary transition-colors">
              Игры
            </Link>
            <Link href="/machines" className="text-text-primary hover:text-accent-primary transition-colors">
              Машины
            </Link>
            <Link href="/support" className="text-text-primary hover:text-accent-primary transition-colors">
              Поддержка
            </Link>
            <Link href="/become-merchant" className="text-text-primary hover:text-accent-primary transition-colors">
              Стать мерчантом
            </Link>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-text-primary hover:text-accent-primary transition-colors"
                >
                  <FaUser className="text-lg" />
                  <span>Профиль</span>
                </button>
                
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-bg-secondary rounded-md shadow-lg py-1 z-50">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Личный кабинет
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Настройки
                    </Link>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-primary"
                      onClick={() => {
                        // TODO: Implement logout
                        setIsLoggedIn(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center space-x-1 text-text-primary hover:text-accent-primary transition-colors"
                >
                  <FaSignInAlt className="text-lg" />
                  <span>Войти</span>
                </Link>
                <Link 
                  href="/register" 
                  className="btn-primary px-4 py-2 rounded-md text-sm whitespace-nowrap flex items-center space-x-1"
                >
                  <FaUserPlus className="text-sm" />
                  <span>Регистрация</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-text-primary hover:text-accent-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/games" 
                className="text-text-primary hover:text-accent-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Игры
              </Link>
              <Link 
                href="/machines" 
                className="text-text-primary hover:text-accent-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Машины
              </Link>
              <Link 
                href="/support" 
                className="text-text-primary hover:text-accent-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Поддержка
              </Link>
              <Link 
                href="/become-merchant" 
                className="text-text-primary hover:text-accent-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Стать мерчантом
              </Link>
            </nav>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <Link 
                    href="/profile" 
                    className="flex items-center space-x-2 text-text-primary hover:text-accent-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUser />
                    <span>Личный кабинет</span>
                  </Link>
                  <button 
                    className="w-full text-left py-2 text-text-primary hover:text-accent-primary transition-colors"
                    onClick={() => {
                      // TODO: Implement logout
                      setIsLoggedIn(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link 
                    href="/login" 
                    className="flex items-center space-x-2 text-text-primary hover:text-accent-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaSignInAlt />
                    <span>Войти</span>
                  </Link>
                  <Link 
                    href="/register" 
                    className="btn-primary px-4 py-2 rounded-md text-center flex items-center justify-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUserPlus />
                    <span>Регистрация</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NewHeader;