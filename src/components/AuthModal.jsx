import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearAuthError, selectAuthError } from '../store/authSlice';

const AuthModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const authError = useSelector(selectAuthError);
  const [tab, setTab] = useState('login'); // 'login' | 'register'
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (tab === 'login') {
      dispatch(login({ username, password }));
    } else {
      if (password !== confirmPassword) {
        dispatch({ type: 'auth/setError', payload: 'Senhas não conferem' });
        return;
      }
      dispatch(register({ username, password }));
    }
  };

  // Close on successful auth (error will be null and isAuthenticated will be true)
  // We don't have direct access to isAuthenticated here in a way that's clean...
  // Let's just let the modal close naturally when the parent detects auth state.
  // Actually, the modal closes when the user clicks outside or the parent detects auth change.

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal animate-fade-in-scale">
        {/* Close button */}
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

          {/* Error message */}
          {authError && (
            <div className="auth-modal__error">{authError}</div>
          )}

          {/* Submit */}
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
