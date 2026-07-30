import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, RootState } from '../types';

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  users: [],
  authError: null,
};

interface AuthPayload {
  username: string;
  password: string;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register: (state, action: PayloadAction<AuthPayload>) => {
      const { username, password } = action.payload;
      state.authError = null;

      if (!username || username.trim().length < 2) {
        state.authError = 'Usuário deve ter pelo menos 2 caracteres';
        return;
      }
      if (!password || password.length < 4) {
        state.authError = 'Senha deve ter pelo menos 4 caracteres';
        return;
      }

      const exists = state.users.some(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
      );
      if (exists) {
        state.authError = 'Este usuário já existe';
        return;
      }

      const newUser = {
        username: username.trim(),
        password: btoa(password),
        createdAt: new Date().toISOString(),
      };

      state.users.push(newUser);
      state.currentUser = { username: username.trim(), createdAt: newUser.createdAt };
      state.isAuthenticated = true;
    },

    login: (state, action: PayloadAction<AuthPayload>) => {
      const { username, password } = action.payload;
      state.authError = null;

      if (!username || !password) {
        state.authError = 'Preencha todos os campos';
        return;
      }

      const user = state.users.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === btoa(password),
      );

      if (!user) {
        state.authError = 'Usuário ou senha inválidos';
        return;
      }

      state.currentUser = { username: user.username, createdAt: user.createdAt };
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.authError = null;
    },

    setAuthError: (state, action: PayloadAction<string>) => {
      state.authError = action.payload;
    },

    clearAuthError: (state) => {
      state.authError = null;
    },
  },
});

export const { register, login, logout, setAuthError, clearAuthError } = authSlice.actions;

export const selectCurrentUser = (state: RootState): User | null => state.auth.currentUser;
export const selectIsAuthenticated = (state: RootState): boolean => state.auth.isAuthenticated;
export const selectAuthError = (state: RootState): string | null => state.auth.authError;

export default authSlice.reducer;
