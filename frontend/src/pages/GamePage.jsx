import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import GameOverModal from '../components/GameOverModal';
// Import the actual API service function for submitting scores
import { submitScore as apiSubmitScore } from '../services/api';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 }; // Right
const GAME_SPEED_MS = 200; // Milliseconds

const GamePage = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const getRandomPosition = useCallback(() => {
    let newFoodPosition;
    do {
      newFoodPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
    return newFoodPosition;
  }, [snake]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    let initialFoodPosition;
    do {
      initialFoodPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (INITIAL_SNAKE.some(segment => segment.x === initialFoodPosition.x && segment.y === initialFoodPosition.y));
    setFood(initialFoodPosition);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameActive(false);
    setGamePaused(false);
    setGameOver(false);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (!gameActive || gamePaused || gameOver) return;
    const gameInterval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Boundary collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          setGameActive(false);
          return prevSnake;
        }
        // Self-collision
        for (let i = 0; i < newSnake.length; i++) {
          if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
            setGameOver(true);
            setGameActive(false);
            return prevSnake;
          }
        }

        newSnake.unshift(head);

        // Food consumption
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood(getRandomPosition());
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, GAME_SPEED_MS);
    return () => clearInterval(gameInterval);
  }, [gameActive, gamePaused, gameOver, direction, food, getRandomPosition]);

  const startGame = useCallback(() => {
    resetGame();
    setGameActive(true);
    setGamePaused(false);
    setGameOver(false);
  }, [resetGame]);

  const togglePause = useCallback(() => {
    if (gameActive && !gameOver) {
      setGamePaused(prev => !prev);
    }
  }, [gameActive, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Allow Enter/Space for modal actions if needed, but not game control if game is over.
      if (gameOver && e.key !== 'Enter' && e.key !== ' ') return;
      
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (gameOver) return; // Modal handles Enter/Space when game is over.
        if (!gameActive) {
          startGame();
        } else {
          togglePause();
        }
        return;
      }

      if (!gameActive || gamePaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':    if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown':  if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft':  if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, gamePaused, gameOver, direction, startGame, togglePause]);

  const handleScoreSubmit = async (playerName) => {
    if (!playerName || playerName.trim() === '') {
        setToastMessage('Player name cannot be empty.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return; 
    }
    try {
      const submittedScoreData = { player_name: playerName, score: score };
      const response = await apiSubmitScore(submittedScoreData);
      setToastMessage(`Score for ${response.player_name} (${response.score}) submitted!`);
      setShowToast(true);
      // Optionally navigate to scoreboard after submission, e.g.:
      // navigate('/scoreboard');
    } catch (error) {
      console.error('Failed to submit score:', error);
      setToastMessage(error.message || 'Failed to submit score. Please try again.');
      setShowToast(true);
    } finally {
      setTimeout(() => setShowToast(false), 3000); 
      setGameOver(false); 
      resetGame(); 
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 md:p-6 space-y-6 text-center flex flex-col items-center">
      <header className="mb-6 w-full">
        <h1 className="font-poppins text-5xl md:text-6xl font-extrabold text-white">
          Pythonic <span className="title-gradient bg-gradient-to-r from-title-gradient-from to-title-gradient-to text-transparent bg-clip-text">Snake</span>
        </h1>
      </header>

      <div id="game-ui" className="space-y-5 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-slate-800/50 rounded-lg shadow-retro-md">
          <div className="flex items-center space-x-2 mb-3 sm:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-brand-accent" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1H3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1h-1V3a1 1 0 00-1-1H5zm10 4H5V8h10V6zM5 10h10v6H5v-6z" clipRule="evenodd" />
            </svg>
            <p className="text-xl text-brand-light-gray">Score: <span className="font-bold text-3xl text-score-text-color score-text transition-transform duration-150 transform scale-100 hover:scale-110">{score}</span></p>
          </div>
          <button 
            onClick={gameOver ? () => {} : (!gameActive ? startGame : togglePause)}
            disabled={gameOver}
            className={`btn ${gameOver ? 'btn-disabled bg-slate-500 cursor-not-allowed' : (!gameActive || gamePaused ? 'btn-primary bg-brand-accent text-brand-dark-bg hover:bg-orange-600' : 'btn-warning bg-button-warning-bg text-brand-dark-bg hover:bg-button-warning-hover')}`}
          >
            {gameOver ? 'Game Over' : (!gameActive ? 'Start Game' : gamePaused ? 'Resume Game' : 'Pause Game')}
          </button>
        </div>

        <div id="game-board-container" className="relative w-full max-w-[480px] mx-auto">
          <GameBoard snake={snake} food={food} gridSize={GRID_SIZE} />
          {(gamePaused || (!gameActive && !gameOver && score === 0)) && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md">
                <span className="font-poppins font-bold text-3xl sm:text-4xl text-white game-message-overlay-text">
                  {gamePaused ? 'Paused' : 'Press Start!'}
                </span>
            </div>
          )}
        </div>
        
        <div className="text-sm text-slate-400 mt-3">
          <p>Use Arrow Keys to move. Space/Enter to Start/Pause.</p>
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/scoreboard" className="btn btn-secondary bg-button-secondary-bg text-brand-light-gray hover:bg-button-secondary-hover">
            View Scoreboard
          </Link>
        </div>
      </div>

      <GameOverModal 
        isOpen={gameOver}
        score={score}
        onSubmitScore={handleScoreSubmit}
        onPlayAgain={startGame} 
      />
      
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-snake-green text-white px-6 py-3 rounded-md shadow-lg z-[100] transition-opacity duration-300">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default GamePage;
