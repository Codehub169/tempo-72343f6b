import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GameOverModal = ({ score, isOpen, onSubmitScore, onPlayAgain }) => {
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset player name when modal opens
      setPlayerName('');
      // Focus on input field
      const inputElement = document.getElementById('player-name-input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmitScore(playerName.trim() || 'Anonymous');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-cubic-bezier">
      <div className="bg-brand-even-darker-gray p-6 sm:p-8 rounded-xl shadow-retro-xl text-center w-full max-w-md border-t-4 border-brand-accent transform transition-all duration-300 ease-cubic-bezier scale-100 opacity-100">
        <h2 className="font-poppins text-4xl font-bold mb-3 text-brand-error">Game Over!</h2>
        <p className="text-xl mb-5 text-brand-light-gray">
          Your Score: <span className="font-bold text-3xl text-score-text-color score-text">{score}</span>
        </p>
        
        <input 
          type="text" 
          id="player-name-input"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value.slice(0, 15))} // Max 15 chars
          placeholder="Enter your name (max 15 chars)"
          maxLength="15"
          className="input-field w-full mb-4 text-center bg-brand-darker-gray text-brand-light-gray border-2 border-button-secondary-bg rounded-lg p-3 transition-colors duration-200 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/50"
        />
        
        <button 
          onClick={handleSubmit}
          className="btn btn-primary w-full mb-3 bg-brand-accent text-brand-dark-bg hover:bg-orange-600"
        >
          Submit Score
        </button>
        
        <div className="mt-2 space-y-3 sm:space-y-0 sm:flex sm:space-x-3 justify-center">
          <button 
            onClick={onPlayAgain}
            className="btn btn-success w-full sm:w-auto bg-button-success-bg text-brand-dark-bg hover:bg-button-success-hover"
          >
            Play Again
          </button>
          <Link 
            to="/scoreboard" 
            className="btn btn-secondary block w-full sm:w-auto bg-button-secondary-bg text-brand-light-gray hover:bg-button-secondary-hover"
          >
            Scoreboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
