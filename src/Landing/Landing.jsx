import React from 'react';
import snakeGif from '../img/snake.gif';
import Leaderboard from '../components/Leaderboard.jsx';
import Footer from '../components/Footer.jsx';
import './Landing.css';

const Landing = ({ onPlay }) => {
  return (
    <div className="landing">
      {/* Animated Background Blobs */}
      <div className="blob blob--1" aria-hidden="true" />
      <div className="blob blob--2" aria-hidden="true" />
      <div className="blob blob--3" aria-hidden="true" />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero__content">
          <div className="hero__decoration animate-fade-in-scale">
            <img src={snakeGif} alt="" className="hero__gif" />
          </div>

          <h1 className="hero__title animate-fade-in-up">
            Snake
            <span className="hero__title-accent"> Game</span>
          </h1>

          <p className="hero__subtitle animate-fade-in-up">
            Reviva a nostalgia do clássico jogo da cobrinha.<br />
            Coma a comida, cresça e desafie sua própria pontuação!
          </p>

          <div className="hero__actions animate-fade-in-up">
            <button className="btn-play" onClick={onPlay}>
              <span className="btn-play__icon">▶</span>
              Jogar Agora
            </button>
          </div>

          <div className="hero__hint animate-fade-in-up">
            <span className="hero__hint-icon">⌨️</span>
            Use as <strong>setas do teclado</strong> para controlar a cobra
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="leaderboard-section" id="leaderboard">
        <div className="container">
          <Leaderboard />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
