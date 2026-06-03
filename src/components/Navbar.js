import React from 'react';
import { useTheme } from '../context/ThemeContext';
import gif from '../img/snake.gif';
import './components.css';

const Navbar = ({ currentPage, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const isGame = currentPage === 'game';

  return (
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
        <div className="user-area">
          <div className="user-area__avatar">M</div>
          <span className="user-area__name">MvDev</span>
          <span className="user-area__chevron">▼</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
