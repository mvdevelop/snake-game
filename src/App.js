
import React from 'react';
import Board from './Board/Board.jsx';

import './App.css';
import Navbar from './components/Navbar.js';

const App = () => (
  <div className="App">
    <Navbar />
    <Board></Board>
  </div>
);

export default App;
