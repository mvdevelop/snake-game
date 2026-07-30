import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { incrementScore, endGame, resetGame, selectHighScore } from '../store/gameSlice';
import { selectCurrentUser } from '../store/authSlice';
import TouchControls from '../components/TouchControls';
import {
  randomIntFromInterval,
  reverseLinkedList,
  useInterval,
} from '../lib/utils';
import type {
  Direction,
  Coords,
  Board as BoardType,
  LinkedListNode,
  LinkedList,
  SnakeCellValue,
} from '../types';
import {
  DIRECTIONS,
  BOARD_SIZE,
  PROBABILITY_OF_DIRECTION_REVERSAL_FOOD,
  MIN_SWIPE_DISTANCE,
  GAME_INTERVAL_MS,
} from '../types';
import './Board.css';

class LinkedListNodeImpl implements LinkedListNode<SnakeCellValue> {
  value: SnakeCellValue;
  next: LinkedListNode<SnakeCellValue> | null;

  constructor(value: SnakeCellValue) {
    this.value = value;
    this.next = null;
  }
}

class LinkedListImpl implements LinkedList<SnakeCellValue> {
  head: LinkedListNode<SnakeCellValue>;
  tail: LinkedListNode<SnakeCellValue>;

  constructor(value: SnakeCellValue) {
    const node = new LinkedListNodeImpl(value);
    this.head = node;
    this.tail = node;
  }
}

const getStartingSnakeLLValue = (board: BoardType): SnakeCellValue => {
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

const Board: React.FC = () => {
  const dispatch = useAppDispatch();
  const highScore = useAppSelector(selectHighScore);
  const currentUser = useAppSelector(selectCurrentUser);

  // Local game state (not persisted — gameplay mechanics)
  const [board, setBoard] = useState<BoardType>(createBoard(BOARD_SIZE));
  const [snake, setSnake] = useState<LinkedList<SnakeCellValue>>(
    new LinkedListImpl(getStartingSnakeLLValue(createBoard(BOARD_SIZE))),
  );
  const [snakeCells, setSnakeCells] = useState<Set<number>>(
    new Set([getStartingSnakeLLValue(createBoard(BOARD_SIZE)).cell]),
  );
  const [foodCell, setFoodCell] = useState<number>(getStartingSnakeLLValue(createBoard(BOARD_SIZE)).cell + 5);
  const [direction, setDirection] = useState<Direction>(DIRECTIONS.RIGHT);
  const [foodShouldReverseDirection, setFoodShouldReverseDirection] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);

  // Touch swipe detection
  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Snake ref to avoid stale closures
  const snakeRef = useRef(snake);
  snakeRef.current = snake;
  const snakeCellsRef = useRef(snakeCells);
  snakeCellsRef.current = snakeCells;
  const directionRef = useRef(direction);
  directionRef.current = direction;
  const foodCellRef = useRef(foodCell);
  foodCellRef.current = foodCell;
  const foodShouldReverseRef = useRef(foodShouldReverseDirection);
  foodShouldReverseRef.current = foodShouldReverseDirection;

  // Unified direction change — used by keyboard, touch buttons, and swipe
  const handleDirectionChange = useCallback((newDirection: Direction) => {
    if (!newDirection) return;

    setGameState((prev) => {
      if (prev === 'idle' || prev === 'gameover') {
        return 'playing';
      }
      return prev;
    });

    setDirection((prevDir) => {
      const snakeWillRunIntoItself =
        getOppositeDirection(newDirection) === prevDir && snakeCellsRef.current.size > 1;
      if (snakeWillRunIntoItself) return prevDir;
      return newDirection;
    });
  }, []);

  // --- Swipe detection ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE && Math.abs(deltaY) < MIN_SWIPE_DISTANCE) {
      return; // Too short — probably a tap, not a swipe
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      handleDirectionChange(deltaX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
    } else {
      handleDirectionChange(deltaY > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
    }

    touchStartRef.current = null;
  }, [handleDirectionChange]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const newDirection = getDirectionFromKey(e.key);
      if (newDirection) {
        handleDirectionChange(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleDirectionChange]);

  useInterval(() => {
    if (gameState === 'playing') {
      moveSnake();
    }
  }, GAME_INTERVAL_MS);

  const moveSnake = () => {
    const currentHeadCoords: Coords = {
      row: snakeRef.current.head.value.row,
      col: snakeRef.current.head.value.col,
    };

    const nextHeadCoords = getCoordsInDirection(currentHeadCoords, directionRef.current);
    if (isOutOfBounds(nextHeadCoords, board)) {
      handleGameOver();
      return;
    }
    const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];
    if (snakeCellsRef.current.has(nextHeadCell)) {
      handleGameOver();
      return;
    }

    const newHead = new LinkedListNodeImpl({
      row: nextHeadCoords.row,
      col: nextHeadCoords.col,
      cell: nextHeadCell,
    });
    const currentHead = snakeRef.current.head;
    snakeRef.current.head = newHead;
    currentHead.next = newHead;

    const newSnakeCells = new Set(snakeCellsRef.current);
    newSnakeCells.delete(snakeRef.current.tail.value.cell);
    newSnakeCells.add(nextHeadCell);

    const newTail = snakeRef.current.tail.next;
    if (newTail === null) {
      snakeRef.current.tail = snakeRef.current.head;
    } else {
      snakeRef.current.tail = newTail;
    }

    const foodConsumed = nextHeadCell === foodCellRef.current;
    if (foodConsumed) {
      growSnake(newSnakeCells);
      if (foodShouldReverseRef.current) reverseSnake();
      handleFoodConsumption(newSnakeCells);
    }

    setSnakeCells(newSnakeCells);
  };

  const growSnake = (newSnakeCells: Set<number>) => {
    const growthNodeCoords = getGrowthNodeCoords(snakeRef.current.tail, directionRef.current);
    if (isOutOfBounds(growthNodeCoords, board)) {
      return;
    }
    const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col];
    const newTail = new LinkedListNodeImpl({
      row: growthNodeCoords.row,
      col: growthNodeCoords.col,
      cell: newTailCell,
    });
    const currentTail = snakeRef.current.tail;
    snakeRef.current.tail = newTail;
    snakeRef.current.tail.next = currentTail;

    newSnakeCells.add(newTailCell);
  };

  const reverseSnake = () => {
    const tailNextNodeDirection = getNextNodeDirection(snakeRef.current.tail, directionRef.current);
    const newDirection = getOppositeDirection(tailNextNodeDirection);
    setDirection(newDirection);

    reverseLinkedList(snakeRef.current.tail);
    const snakeHead = snakeRef.current.head;
    snakeRef.current.head = snakeRef.current.tail;
    snakeRef.current.tail = snakeHead;
  };

  const handleFoodConsumption = (newSnakeCells: Set<number>) => {
    const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
    let nextFoodCell: number;
    while (true) {
      nextFoodCell = randomIntFromInterval(1, maxPossibleCellValue);
      if (newSnakeCells.has(nextFoodCell) || foodCellRef.current === nextFoodCell) continue;
      break;
    }

    const nextFoodShouldReverseDirection =
      Math.random() < PROBABILITY_OF_DIRECTION_REVERSAL_FOOD;

    setFoodCell(nextFoodCell);
    setFoodShouldReverseDirection(nextFoodShouldReverseDirection);
    setScore((prev) => prev + 1);
    dispatch(incrementScore());
  };

  const handleGameOver = () => {
    setGameState('gameover');
    const finalScore = score;

    // Dispatch to Redux — persists via redux-persist
    dispatch(
      endGame({
        score: finalScore,
        player: currentUser?.username || 'Anonymous',
      }),
    );

    const snakeLLStartingValue = getStartingSnakeLLValue(board);
    setSnake(new LinkedListImpl(snakeLLStartingValue));
    setFoodCell(snakeLLStartingValue.cell + 5);
    setSnakeCells(new Set([snakeLLStartingValue.cell]));
    setDirection(DIRECTIONS.RIGHT);
  };

  const handleRestart = () => {
    setGameState('idle');
    setScore(0);
    dispatch(resetGame());
    const newBoard = createBoard(BOARD_SIZE);
    setBoard(newBoard);
    const snakeLLStartingValue = getStartingSnakeLLValue(newBoard);
    setSnake(new LinkedListImpl(snakeLLStartingValue));
    setFoodCell(snakeLLStartingValue.cell + 5);
    setSnakeCells(new Set([snakeLLStartingValue.cell]));
    setDirection(DIRECTIONS.RIGHT);
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
                  : `Você fez ${score} pontos!`}
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

const createBoard = (size: number): BoardType => {
  let counter = 1;
  const board: BoardType = [];
  for (let row = 0; row < size; row++) {
    const currentRow: number[] = [];
    for (let col = 0; col < size; col++) {
      currentRow.push(counter++);
    }
    board.push(currentRow);
  }
  return board;
};

const getCoordsInDirection = (coords: Coords, direction: Direction): Coords => {
  if (direction === DIRECTIONS.UP) {
    return { row: coords.row - 1, col: coords.col };
  }
  if (direction === DIRECTIONS.RIGHT) {
    return { row: coords.row, col: coords.col + 1 };
  }
  if (direction === DIRECTIONS.DOWN) {
    return { row: coords.row + 1, col: coords.col };
  }
  if (direction === DIRECTIONS.LEFT) {
    return { row: coords.row, col: coords.col - 1 };
  }
  return coords;
};

const isOutOfBounds = (coords: Coords, board: BoardType): boolean => {
  const { row, col } = coords;
  if (row < 0 || col < 0) return true;
  if (row >= board.length || col >= board[0].length) return true;
  return false;
};

const getDirectionFromKey = (key: string): Direction | '' => {
  if (key === 'ArrowUp') return DIRECTIONS.UP;
  if (key === 'ArrowRight') return DIRECTIONS.RIGHT;
  if (key === 'ArrowDown') return DIRECTIONS.DOWN;
  if (key === 'ArrowLeft') return DIRECTIONS.LEFT;
  return '';
};

const getNextNodeDirection = (
  node: LinkedListNode<SnakeCellValue>,
  currentDirection: Direction,
): Direction => {
  if (node.next === null) return currentDirection;
  const { row: currentRow, col: currentCol } = node.value;
  const { row: nextRow, col: nextCol } = node.next.value;
  if (nextRow === currentRow && nextCol === currentCol + 1) return DIRECTIONS.RIGHT;
  if (nextRow === currentRow && nextCol === currentCol - 1) return DIRECTIONS.LEFT;
  if (nextCol === currentCol && nextRow === currentRow + 1) return DIRECTIONS.DOWN;
  if (nextCol === currentCol && nextRow === currentRow - 1) return DIRECTIONS.UP;
  return currentDirection;
};

const getGrowthNodeCoords = (snakeTail: LinkedListNode<SnakeCellValue>, currentDirection: Direction): Coords => {
  const tailNextNodeDirection = getNextNodeDirection(snakeTail, currentDirection);
  const growthDirection = getOppositeDirection(tailNextNodeDirection);
  const currentTailCoords: Coords = { row: snakeTail.value.row, col: snakeTail.value.col };
  const growthNodeCoords = getCoordsInDirection(currentTailCoords, growthDirection);
  return growthNodeCoords;
};

const getOppositeDirection = (direction: Direction): Direction => {
  if (direction === DIRECTIONS.UP) return DIRECTIONS.DOWN;
  if (direction === DIRECTIONS.RIGHT) return DIRECTIONS.LEFT;
  if (direction === DIRECTIONS.DOWN) return DIRECTIONS.UP;
  if (direction === DIRECTIONS.LEFT) return DIRECTIONS.RIGHT;
  return DIRECTIONS.RIGHT;
};

const getCellClassName = (
  cellValue: number,
  foodCell: number,
  foodShouldReverseDirection: boolean,
  snakeCells: Set<number>,
): string => {
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
