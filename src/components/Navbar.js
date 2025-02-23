
import React from 'react';
import './components.css';

import gif from '../img/snake.gif';

function Navbar() {
  return (
    <>
        <div className='navbar'>
            <img className='gif' src={gif} alt="" />
            <h2>Snake Game</h2>
            <img className='gif' src={gif} alt="" />
        </div>
    </>
  )
}

export default Navbar;
