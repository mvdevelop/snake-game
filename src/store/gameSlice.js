import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  highScore: 0,
  scores: [],
  currentScore: 0,
  gameState: 'idle', // 'idle' | 'playing' | 'gameover'
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    incrementScore: (state) => {
      state.currentScore += 1;
    },

    setGameState: (state, action) => {
      state.gameState = action.payload;
    },

    endGame: (state, action) => {
      const { score, player } = action.payload || {};
      const finalScore = score !== undefined ? score : state.currentScore;
      const playerName = player || 'Anonymous';

      // Update high score
      if (finalScore > state.highScore) {
        state.highScore = finalScore;
      }

      // Add to scores list
      state.scores.push({
        player: playerName,
        score: finalScore,
        date: new Date().toISOString().split('T')[0],
      });

      // Sort scores descending, keep top 10
      state.scores.sort((a, b) => b.score - a.score);
      if (state.scores.length > 10) {
        state.scores = state.scores.slice(0, 10);
      }

      state.currentScore = finalScore;
      state.gameState = 'gameover';
    },

    resetGame: (state) => {
      state.currentScore = 0;
      state.gameState = 'idle';
    },
  },
});

export const {
  incrementScore,
  setGameState,
  endGame,
  resetGame,
} = gameSlice.actions;

export const selectHighScore = (state) => state.game.highScore;
export const selectScores = (state) => state.game.scores;
export const selectCurrentScore = (state) => state.game.currentScore;
export const selectGameState = (state) => state.game.gameState;

export default gameSlice.reducer;
