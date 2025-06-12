import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Import the actual API service function for fetching scores
import { getScores as apiGetScores } from '../services/api';

const ScoreboardPage = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        // Use the imported API function to fetch scores
        const fetchedScores = await apiGetScores(); // Default limit is 10 by API if not specified
        setScores(fetchedScores);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch scores:', err);
        setError(err.message || 'Failed to load scores. Please try again later.');
        setScores([]); // Clear scores on error
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []); // Empty dependency array means this runs once on mount

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'rank-1 bg-medal-gold text-brand-dark-bg';
    if (rank === 2) return 'rank-2 bg-medal-silver text-brand-dark-bg';
    if (rank === 3) return 'rank-3 bg-medal-bronze text-brand-off-white';
    return 'rank-other text-slate-400 font-semibold';
  };

  const getPlayerNameStyle = (rank) => {
    if (rank <=3) return 'font-semibold';
    return '';
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4 md:p-6 space-y-8 flex flex-col items-center min-h-screen justify-center">
      <header className="text-center">
        <h1 className="font-poppins text-5xl md:text-6xl font-extrabold text-white">
          Global <span className="title-gradient-scoreboard bg-gradient-to-r from-title-gradient-scoreboard-from to-title-gradient-scoreboard-to text-transparent bg-clip-text">Scoreboard</span>
        </h1>
      </header>

      {loading && <p className="text-brand-light-gray text-xl">Loading scores...</p>}
      {error && <p className="text-brand-error text-xl">Error: {error}</p>}
      
      {!loading && !error && (
        <div className="scoreboard-container bg-brand-even-darker-gray rounded-xl shadow-retro-lg overflow-hidden w-full">
          <div className="score-header grid grid-cols-12 gap-x-2 p-4 text-sm bg-brand-darker-gray text-brand-medium-gray font-bold uppercase tracking-wider">
            <div className="col-span-2 text-left pl-2">Rank</div>
            <div className="col-span-6 text-left">Player</div>
            <div className="col-span-4 text-right pr-2">Score</div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {scores.length > 0 ? scores.map((scoreItem, index) => (
              <div key={scoreItem.id} className="score-entry grid grid-cols-12 gap-x-2 p-4 items-center border-b border-brand-darker-gray last:border-b-0 hover:bg-slate-700/50 transition-colors duration-150">
                <div className="col-span-2 flex justify-start pl-1">
                  {index < 3 ? (
                    <span className={`rank-badge w-9 h-9 inline-flex items-center justify-center rounded-full text-sm shadow-md ${getRankBadgeClass(index + 1)}`}>
                      {index + 1}
                    </span>
                  ) : (
                    <span className={`pl-2 ${getRankBadgeClass(index + 1)}`}>{index + 1}</span>
                  )}
                </div>
                <div className={`player-name col-span-6 truncate text-brand-light-gray ${getPlayerNameStyle(index + 1)}`}>
                  {index === 0 && '🏆 '}{index === 1 && '🥈 '}{index === 2 && '🥉 '}{scoreItem.player_name}
                </div>
                <div className="player-score col-span-4 text-right pr-2 text-lg font-bold text-score-text-color">
                  {scoreItem.score}
                </div>
              </div>
            )) : (
              <p className='text-center p-6 text-brand-light-gray'>No scores yet. Be the first!</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link to="/" className="btn btn-success bg-button-success-bg text-brand-off-white hover:bg-button-success-hover text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 -mt-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
          </svg>
          Play Again!
        </Link>
      </div>
    </div>
  );
};

export default ScoreboardPage;
