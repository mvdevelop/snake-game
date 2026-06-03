import React from 'react';
import { useSelector } from 'react-redux';
import { selectScores } from '../store/gameSlice';
import './components.css';

const RANK_MEDAL = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

const Leaderboard = () => {
  const scores = useSelector(selectScores);

  return (
    <div className="leaderboard">
      <div className="leaderboard__header">
        <span className="leaderboard__label">Leaderboard</span>
        <h2 className="leaderboard__title">Melhores Pontuações</h2>
        <p className="leaderboard__subtitle">
          Os jogadores mais habilidosos do Snake Game
        </p>
      </div>

      <div className="leaderboard__card">
        <div className="leaderboard__table">
          {/* Header row */}
          <div className="leaderboard__row leaderboard__row--header">
            <span className="leaderboard__col leaderboard__col--rank">#</span>
            <span className="leaderboard__col leaderboard__col--player">Jogador</span>
            <span className="leaderboard__col leaderboard__col--score">Pontos</span>
            <span className="leaderboard__col leaderboard__col--date">Data</span>
          </div>

          {/* Score rows */}
          {scores.length === 0 ? (
            <div className="leaderboard__row" style={{ justifyContent: 'center', display: 'flex', gridColumn: '1 / -1', padding: '40px 20px' }}>
              <p className="leaderboard__empty" style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                Nenhuma pontuação ainda. Seja o primeiro a jogar!
              </p>
            </div>
          ) : (
            scores.map((entry, index) => {
              const rank = index + 1;
              return (
                <div
                  key={`${entry.player}-${entry.date}-${index}`}
                  className={`leaderboard__row ${
                    rank <= 3 ? 'leaderboard__row--top' : ''
                  }`}
                >
                  <span className="leaderboard__col leaderboard__col--rank">
                    {RANK_MEDAL[rank] || rank}
                  </span>
                  <span className="leaderboard__col leaderboard__col--player">
                    {entry.player}
                  </span>
                  <span className="leaderboard__col leaderboard__col--score">
                    {entry.score}
                  </span>
                  <span className="leaderboard__col leaderboard__col--date">
                    {entry.date}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <p className="leaderboard__footnote">
          ⚡ Sua pontuação será salva automaticamente ao finalizar uma partida!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
