import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useTheme } from '../context/ThemeContext';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../store/authSlice';
import AuthModal from './AuthModal';
import type { NavbarProps } from '../types';
import gif from '../img/snake.gif';
import './components.css';

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isGame = currentPage === 'game';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
  };

  // Close auth modal when authentication succeeds
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, showAuthModal]);

  const userInitial = currentUser?.username?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <nav className="navbar">
        {/* Left: Logo + Title */}
        <div className="navbar__left">
          <img className="navbar__gif" src={gif} alt="" />
          <h2 className="navbar__title">
            Snake<span className="navbar__title-accent">Game</span>
          </h2>

          {isGame && (
            <button
              className="navbar__back-btn"
              onClick={() => onNavigate('landing')}
            >
              ← <span>Menu</span>
            </button>
          )}
        </div>

        {/* Right: Theme Toggle + User Area */}
        <div className="navbar__right">
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            <span className="theme-toggle__icon">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
          </button>

          {/* User Area */}
          {isAuthenticated ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <div
                className="user-area"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-area__avatar">{userInitial}</div>
                <span className="user-area__name">{currentUser?.username}</span>
                <span className="user-area__chevron">▼</span>
              </div>

              {showDropdown && (
                <div className="user-dropdown__menu">
                  <div className="user-dropdown__item" style={{ fontWeight: 600, cursor: 'default' }}>
                    {currentUser?.username}
                  </div>
                  <div className="user-dropdown__divider" />
                  <button
                    className="user-dropdown__item user-dropdown__item--danger"
                    onClick={handleLogout}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowAuthModal(true)}>
              Entrar
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Navbar;
