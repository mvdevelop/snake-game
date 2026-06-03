import React from 'react';
import './components.css';

const MOCK_SCORES = [
  { rank: 1, player: 'MvDev', score: 42, date: '2026-05-28' },
  { rank: 2, player: 'CobraNinja', score: 35, date: '2026-05-30' },
  { rank: 3, player: 'PixelQueen', score: 28, date: '2026-05-25' },
  { rank: 4, player: 'SnakeKing', score: 22, date: '2026-05-20' },
  { rank: 5, player: 'RetroGamer', score: 18, date: '2026-05-15' },
  { rank: 6, player: 'ByteHunter', score: 14, date: '2026-05-10' },
];

const RANK_MEDAL = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

const Leaderboard = () => {
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
          {MOCK_SCORES.map((entry) => (
            <div
              key={entry.rank}
              className={`leaderboard__row ${
                entry.rank <= 3 ? 'leaderboard__row--top' : ''
              }`}
            >
              <span className="leaderboard__col leaderboard__col--rank">
                {RANK_MEDAL[entry.rank] || entry.rank}
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
          ))}
        </div>

        <p className="leaderboard__footnote">
          ⚡ Sua pontuação será salva automaticamente ao finalizar uma partida!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
