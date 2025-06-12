import React from 'react';

const GameBoard = ({ snake, food, gridSize = 20 }) => {
  // Styles based on HTML preview and tailwind.config.js
  const getGridCellStyle = (x, y) => {
    // Check if the current cell is part of the snake
    const isSnakeSegment = snake.some(segment => segment.x === x && segment.y === y);
    // Check if the current cell is food
    const isFoodItem = food.x === x && food.y === y;

    let cellClasses = 'w-full h-full'; // Base cell style

    if (isSnakeSegment) {
      cellClasses += ' bg-snake-green border border-green-700 rounded-[25%] shadow-inner-sm'; // snake-segment style
    } else if (isFoodItem) {
      cellClasses += ' bg-gradient-radial from-orange-300 to-brand-accent rounded-full animate-pulseFood shadow-[0_0_10px_#FF9800,0_0_5px_#FF9800_inset]'; // food-item style
    }
    return cellClasses;
  };

  return (
    <div 
      className="game-board grid mx-auto border-3 border-game-board-border bg-brand-darker-gray shadow-retro-lg rounded-lg"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        // Responsive sizing, using vw/vh for game board could be tricky with grid, fixed aspect ratio is better.
        // Max-width and max-height will be controlled by parent for responsiveness.
        // Using aspect-square to maintain square cells and board.
        aspectRatio: '1 / 1',
        width: '100%', // Take full width of parent, parent will control max-width
      }}
    >
      {/* Create grid cells */}
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        return (
          <div key={`${x}-${y}`} className="flex items-center justify-center">
            <div className={getGridCellStyle(x, y)}></div>
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
