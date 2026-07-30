import React, { useCallback, useRef } from 'react';
import type { TouchControlsProps, Direction } from '../types';
import { DIRECTIONS } from '../types';

const TouchControls: React.FC<TouchControlsProps> = ({ onDirectionChange }) => {
  const activeButton = useRef<string | null>(null);

  const handlePress = useCallback(
    (dir: Direction) => (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeButton.current === dir) return;
      activeButton.current = dir;
      onDirectionChange(dir);
    },
    [onDirectionChange],
  );

  const handleRelease = useCallback(() => {
    activeButton.current = null;
  }, []);

  return (
    <div className="touch-controls">
      <div className="touch-controls__dpad">
        {/* Up */}
        <button
          className="touch-btn touch-btn--up"
          onTouchStart={handlePress(DIRECTIONS.UP)}
          onTouchEnd={handleRelease}
          onTouchCancel={handleRelease}
          onMouseDown={handlePress(DIRECTIONS.UP)}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          aria-label="Cima"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5l-7 7h14l-7-7z" fill="currentColor" />
          </svg>
        </button>

        {/* Left */}
        <button
          className="touch-btn touch-btn--left"
          onTouchStart={handlePress(DIRECTIONS.LEFT)}
          onTouchEnd={handleRelease}
          onTouchCancel={handleRelease}
          onMouseDown={handlePress(DIRECTIONS.LEFT)}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          aria-label="Esquerda"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l7-7v14l-7-7z" fill="currentColor" />
          </svg>
        </button>

        {/* Center */}
        <div className="touch-btn touch-btn--center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.4" />
          </svg>
        </div>

        {/* Right */}
        <button
          className="touch-btn touch-btn--right"
          onTouchStart={handlePress(DIRECTIONS.RIGHT)}
          onTouchEnd={handleRelease}
          onTouchCancel={handleRelease}
          onMouseDown={handlePress(DIRECTIONS.RIGHT)}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          aria-label="Direita"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12l-7 7V5l7 7z" fill="currentColor" />
          </svg>
        </button>

        {/* Down */}
        <button
          className="touch-btn touch-btn--down"
          onTouchStart={handlePress(DIRECTIONS.DOWN)}
          onTouchEnd={handleRelease}
          onTouchCancel={handleRelease}
          onMouseDown={handlePress(DIRECTIONS.DOWN)}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          aria-label="Baixo"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 19l7-7H5l7 7z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TouchControls;
