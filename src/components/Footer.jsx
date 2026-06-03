import React from 'react';
import './components.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <h3 className="footer__logo">
              Snake<span className="footer__logo-accent">Game</span>
            </h3>
            <p className="footer__description">
              Reviva a nostalgia do clássico jogo da cobrinha direto no seu navegador.
            </p>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Links</h4>
            <a href="#hero" className="footer__link">Início</a>
            <a href="#leaderboard" className="footer__link">Leaderboard</a>
          </div>

          <div className="footer__social">
            <h4 className="footer__heading">Conecte-se</h4>
            <div className="footer__social-icons">
              <a
                href="https://github.com/mvdevelop"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="GitHub"
              >
                <i className="bi bi-github"></i>
              </a>
              <a
                href="https://linkedin.com/in/mvdevelop"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
              <a
                href="https://instagram.com/mvdevelop"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} Snake Game. Todos os direitos reservados.
          </p>
          <p className="footer__credit">
            Feito com <span className="footer__heart">♥</span> por{' '}
            <a href="https://github.com/mvdevelop" target="_blank" rel="noopener noreferrer">
              MvDev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
