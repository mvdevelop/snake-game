import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Board from './Board/Board';
import Landing from './Landing/Landing';
import './App.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');

  return (
    <div className="App">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="App__main">
        {currentPage === 'landing' ? (
          <Landing onPlay={() => setCurrentPage('game')} />
        ) : (
          <Board />
        )}
      </main>
    </div>
  );
};

export default App;
