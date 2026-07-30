import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, register, setAuthError, clearAuthError, selectAuthError } from '../store/authSlice';
import type { AuthModalProps } from '../types';
import './components.css';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const authError = useAppSelector(selectAuthError);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      dispatch(clearAuthError());
    }
  }, [isOpen, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === 'login') {
      dispatch(login({ username, password }));
    } else {
      if (password !== confirmPassword) {
        dispatch(setAuthError('Senhas não conferem'));
        return;
      }
      dispatch(register({ username, password }));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal animate-fade-in-scale">
        <button className="auth-modal__close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        {/* Tabs */}
        <div className="auth-modal__tabs">
          <button
            className={`auth-modal__tab ${tab === 'login' ? 'auth-modal__tab--active' : ''}`}
            onClick={() => { setTab('login'); dispatch(clearAuthError()); }}
          >
            Entrar
          </button>
          <button
            className={`auth-modal__tab ${tab === 'register' ? 'auth-modal__tab--active' : ''}`}
            onClick={() => { setTab('register'); dispatch(clearAuthError()); }}
          >
            Criar Conta
          </button>
        </div>

        {/* Form */}
        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <div className="auth-modal__field">
            <label className="auth-modal__label">Usuário</label>
            <input
              className="auth-modal__input"
              type="text"
              placeholder="Seu nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="auth-modal__field">
            <label className="auth-modal__label">Senha</label>
            <input
              className="auth-modal__input"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {tab === 'register' && (
            <div className="auth-modal__field">
              <label className="auth-modal__label">Confirmar Senha</label>
              <input
                className="auth-modal__input"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}

          {authError && (
            <div className="auth-modal__error">{authError}</div>
          )}

          <button type="submit" className="auth-modal__submit">
            {tab === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <p className="auth-modal__footnote">
          {tab === 'login' ? (
            <>
              Não tem conta?{' '}
              <button
                className="auth-modal__link"
                onClick={() => { setTab('register'); dispatch(clearAuthError()); }}
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button
                className="auth-modal__link"
                onClick={() => { setTab('login'); dispatch(clearAuthError()); }}
              >
                Faça login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
