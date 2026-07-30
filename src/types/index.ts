/* ============================================= */
/* SHARED TYPES                                  */
/* ============================================= */

// ---- Direction ----

export type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

export const DIRECTIONS: Record<string, Direction> = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
} as const;

// ---- Coordinates ----

export interface Coords {
  row: number;
  col: number;
}

// ---- Board ----

export type Board = number[][];
export type CellValue = number;

// ---- Linked List ----

export interface LinkedListNode<T> {
  value: T;
  next: LinkedListNode<T> | null;
}

export interface LinkedList<T> {
  head: LinkedListNode<T>;
  tail: LinkedListNode<T>;
}

// ---- Snake Cell ----

export interface SnakeCellValue {
  row: number;
  col: number;
  cell: number;
}

// ---- Auth (Redux) ----

export interface User {
  username: string;
  createdAt: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: UserWithPassword[];
  authError: string | null;
}

// ---- Game (Redux) ----

export type GameStateStatus = 'idle' | 'playing' | 'gameover';

export interface ScoreEntry {
  player: string;
  score: number;
  date: string;
}

export interface GameSliceState {
  highScore: number;
  scores: ScoreEntry[];
  currentScore: number;
  gameState: GameStateStatus;
}

// ---- Root State ----

export interface RootState {
  auth: AuthState;
  game: GameSliceState;
}

// ---- Theme ----

export type Theme = 'dark' | 'light';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// ---- Component Props ----

export interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export interface LandingProps {
  onPlay: () => void;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TouchControlsProps {
  onDirectionChange: (dir: Direction) => void;
}

// ---- Board Constants ----

export const BOARD_SIZE = 15;
export const PROBABILITY_OF_DIRECTION_REVERSAL_FOOD = 0.3;
export const MIN_SWIPE_DISTANCE = 30;
export const GAME_INTERVAL_MS = 150;
