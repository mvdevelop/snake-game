import React, {useEffect, useState, useCallback, useRef} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incrementScore, endGame, resetGame, selectHighScore } from '../store/gameSlice';
import { selectCurrentUser } from '../store/authSlice';
import TouchControls from '../components/TouchControls';
import {
  randomIntFromInterval,
  reverseLinkedList,
  useInterval,
} from '../lib/utils.js';

import './Board.css';

class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor(value) {
    const node = new LinkedListNode(value);
    this.head = node;
    this.tail = node;
  }
}

const Direction = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
};

const BOARD_SIZE = 15;
const PROBABILITY_OF_DIRECTION_REVERSAL_FOOD = 0.3;

const getStartingSnakeLLValue = board => {
  const rowSize = board.length;
  const colSize = board[0].length;
  const startingRow = Math.round(rowSize / 3);
  const startingCol = Math.round(colSize / 3);
  const startingCell = board[startingRow][startingCol];
  return {
    row: startingRow,
    col: startingCol,
    cell: startingCell,
  };
};

const Board = () => {
  const dispatch = useDispatch();
  const highScore = useSelector(selectHighScore);
  const currentUser = useSelector(selectCurrentUser);

  // Local game state (not persisted — gameplay mechanics)
  const [board, setBoard] = useState(createBoard(BOARD_SIZE));
  const [snake, setSnake] = useState(
    new LinkedList(getStartingSnakeLLValue(board)),
  );
  const [snakeCells, setSnakeCells] = useState(
    new Set([snake.head.value.cell]),
  );
  const [foodCell, setFoodCell] = useState(snake.head.value.cell + 5);
  const [direction, setDirection] = useState(Direction.RIGHT);
  const [foodShouldReverseDirection, setFoodShouldReverseDirection] = useState(false);
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);

  // Touch swipe detection
  const boardWrapperRef = useRef(null);
  const touchStartRef = useRef(null);

  // Unified direction change — used by keyboard, touch buttons, and swipe
  const handleDirectionChange = useCallback((newDirection) => {
    if (!newDirection) return;

    setGameState(prev => {
      if (prev === 'idle' || prev === 'gameover') {
        return 'playing';
      }
      return prev;
    });

    setDirection(prevDir => {
      const snakeWillRunIntoItself =
        getOppositeDirection(newDirection) === prevDir && snakeCells.size > 1;
      if (snakeWillRunIntoItself) return prevDir;
      return newDirection;
    });
  }, [snakeCells]);

  // --- Swipe detection ---
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      return; // Too short — probably a tap, not a swipe
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      handleDirectionChange(deltaX > 0 ? Direction.RIGHT : Direction.LEFT);
    } else {
      handleDirectionChange(deltaY > 0 ? Direction.DOWN : Direction.UP);
    }

    touchStartRef.current = null;
  }, [handleDirectionChange]);

  useEffect(() => {
    window.addEventListener('keydown', e => {
      handleKeydown(e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(() => {
    if (gameState === 'playing') {
      moveSnake();
    }
  }, 150);

  const handleKeydown = useCallback(e => {
    const newDirection = getDirectionFromKey(e.key);
    if (newDirection) {
      handleDirectionChange(newDirection);
    }
  }, [handleDirectionChange]);

  const moveSnake = () => {
    const currentHeadCoords = {
      row: snake.head.value.row,
      col: snake.head.value.col,
    };

    const nextHeadCoords = getCoordsInDirection(currentHeadCoords, direction);
    if (isOutOfBounds(nextHeadCoords, board)) {
      handleGameOver();
      return;
    }
    const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];
    if (snakeCells.has(nextHeadCell)) {
      handleGameOver();
      return;
    }

    const newHead = new LinkedListNode({
      row: nextHeadCoords.row,
      col: nextHeadCoords.col,
      cell: nextHeadCell,
    });
    const currentHead = snake.head;
    snake.head = newHead;
    currentHead.next = newHead;

    const newSnakeCells = new Set(snakeCells);
    newSnakeCells.delete(snake.tail.value.cell);
    newSnakeCells.add(nextHeadCell);

    snake.tail = snake.tail.next;
    if (snake.tail === null) snake.tail = snake.head;

    const foodConsumed = nextHeadCell === foodCell;
    if (foodConsumed) {
      growSnake(newSnakeCells);
      if (foodShouldReverseDirection) reverseSnake();
      handleFoodConsumption(newSnakeCells);
    }

    setSnakeCells(newSnakeCells);
  };

  const growSnake = newSnakeCells => {
    const growthNodeCoords = getGrowthNodeCoords(snake.tail, direction);
    if (isOutOfBounds(growthNodeCoords, board)) {
      return;
    }
    const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col];
    const newTail = new LinkedListNode({
      row: growthNodeCoords.row,
      col: growthNodeCoords.col,
      cell: newTailCell,
    });
    const currentTail = snake.tail;
    snake.tail = newTail;
    snake.tail.next = currentTail;

    newSnakeCells.add(newTailCell);
  };

  const reverseSnake = () => {
    const tailNextNodeDirection = getNextNodeDirection(snake.tail, direction);
    const newDirection = getOppositeDirection(tailNextNodeDirection);
    setDirection(newDirection);

    reverseLinkedList(snake.tail);
    const snakeHead = snake.head;
    snake.head = snake.tail;
    snake.tail = snakeHead;
  };

  const handleFoodConsumption = newSnakeCells => {
    const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
    let nextFoodCell;
    while (true) {
      nextFoodCell = randomIntFromInterval(1, maxPossibleCellValue);
      if (newSnakeCells.has(nextFoodCell) || foodCell === nextFoodCell)
        continue;
      break;
    }

    const nextFoodShouldReverseDirection =
      Math.random() < PROBABILITY_OF_DIRECTION_REVERSAL_FOOD;

    setFoodCell(nextFoodCell);
    setFoodShouldReverseDirection(nextFoodShouldReverseDirection);
    setScore(prev => prev + 1);
    dispatch(incrementScore());
  };

  const handleGameOver = () => {
    setGameState('gameover');
    const finalScore = score;

    // Dispatch to Redux — persists via redux-persist
    dispatch(endGame({
      score: finalScore,
      player: currentUser?.username || 'Anonymous',
    }));

    const snakeLLStartingValue = getStartingSnakeLLValue(board);
    setSnake(new LinkedList(snakeLLStartingValue));
    setFoodCell(snakeLLStartingValue.cell + 5);
    setSnakeCells(new Set([snakeLLStartingValue.cell]));
    setDirection(Direction.RIGHT);
  };

  const handleRestart = () => {
    setGameState('idle');
    setScore(0);
    dispatch(resetGame());
    const newBoard = createBoard(BOARD_SIZE);
    setBoard(newBoard);
    const snakeLLStartingValue = getStartingSnakeLLValue(newBoard);
    setSnake(new LinkedList(snakeLLStartingValue));
    setFoodCell(snakeLLStartingValue.cell + 5);
    setSnakeCells(new Set([snakeLLStartingValue.cell]));
    setDirection(Direction.RIGHT);
    setFoodShouldReverseDirection(false);
  };

  return (
    <div className="game-page">
      <div className="game-page__header">
        <div className="game-page__score">
          <span className="game-page__score-label">Pontuação</span>
          <span className="game-page__score-value">{score}</span>
        </div>
        <div className="game-page__score game-page__score--high">
          <span className="game-page__score-label">Recorde</span>
          <span className="game-page__score-value">{highScore}</span>
        </div>
      </div>

      <div
        className="game-page__board-wrapper"
        ref={boardWrapperRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="board">
          {board.map((row, rowIdx) => (
            <div key={rowIdx} className="board__row">
              {row.map((cellValue, cellIdx) => {
                const className = getCellClassName(
                  cellValue,
                  foodCell,
                  foodShouldReverseDirection,
                  snakeCells,
                );
                return <div key={cellIdx} className={className}></div>;
              })}
            </div>
          ))}
        </div>

        {gameState === 'idle' && (
          <div className="game-page__overlay">
            <div className="game-page__overlay-content">
              <span className="game-page__overlay-icon">⌨️</span>
              <h3 className="game-page__overlay-title">Pronto para Jogar?</h3>
              <p className="game-page__overlay-text">
                Pressione as <strong>setas</strong> ou <strong>deslize</strong> para começar!
              </p>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="game-page__overlay">
            <div className="game-page__overlay-content">
              <span className="game-page__overlay-icon">💀</span>
              <h3 className="game-page__overlay-title">Game Over!</h3>
              <p className="game-page__overlay-text">
                {score === highScore && score > 0
                  ? '🎉 Novo recorde!'
                  : `Você fez ${score} pontos!`
                }
              </p>
              <button className="game-page__restart-btn" onClick={handleRestart}>
                Jogar Novamente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile touch controls */}
      <TouchControls onDirectionChange={handleDirectionChange} />
    </div>
  );
};

const createBoard = BOARD_SIZE => {
  let counter = 1;
  const board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      currentRow.push(counter++);
    }
    board.push(currentRow);
  }
  return board;
};

const getCoordsInDirection = (coords, direction) => {
  if (direction === Direction.UP) {
    return { row: coords.row - 1, col: coords.col };
  }
  if (direction === Direction.RIGHT) {
    return { row: coords.row, col: coords.col + 1 };
  }
  if (direction === Direction.DOWN) {
    return { row: coords.row + 1, col: coords.col };
  }
  if (direction === Direction.LEFT) {
    return { row: coords.row, col: coords.col - 1 };
  }
};

const isOutOfBounds = (coords, board) => {
  const {row, col} = coords;
  if (row < 0 || col < 0) return true;
  if (row >= board.length || col >= board[0].length) return true;
  return false;
};

const getDirectionFromKey = key => {
  if (key === 'ArrowUp') return Direction.UP;
  if (key === 'ArrowRight') return Direction.RIGHT;
  if (key === 'ArrowDown') return Direction.DOWN;
  if (key === 'ArrowLeft') return Direction.LEFT;
  return '';
};

const getNextNodeDirection = (node, currentDirection) => {
  if (node.next === null) return currentDirection;
  const {row: currentRow, col: currentCol} = node.value;
  const {row: nextRow, col: nextCol} = node.next.value;
  if (nextRow === currentRow && nextCol === currentCol + 1) return Direction.RIGHT;
  if (nextRow === currentRow && nextCol === currentCol - 1) return Direction.LEFT;
  if (nextCol === currentCol && nextRow === currentRow + 1) return Direction.DOWN;
  if (nextCol === currentCol && nextRow === currentRow - 1) return Direction.UP;
  return '';
};

const getGrowthNodeCoords = (snakeTail, currentDirection) => {
  const tailNextNodeDirection = getNextNodeDirection(snakeTail, currentDirection);
  const growthDirection = getOppositeDirection(tailNextNodeDirection);
  const currentTailCoords = { row: snakeTail.value.row, col: snakeTail.value.col };
  const growthNodeCoords = getCoordsInDirection(currentTailCoords, growthDirection);
  return growthNodeCoords;
};

const getOppositeDirection = direction => {
  if (direction === Direction.UP) return Direction.DOWN;
  if (direction === Direction.RIGHT) return Direction.LEFT;
  if (direction === Direction.DOWN) return Direction.UP;
  if (direction === Direction.LEFT) return Direction.RIGHT;
};

const getCellClassName = (
  cellValue,
  foodCell,
  foodShouldReverseDirection,
  snakeCells,
) => {
  let className = 'board__cell';
  if (cellValue === foodCell) {
    if (foodShouldReverseDirection) {
      className = 'board__cell board__cell--purple';
    } else {
      className = 'board__cell board__cell--red';
    }
  }
  if (snakeCells.has(cellValue)) className = 'board__cell board__cell--green';
  return className;
};

export default Board;
