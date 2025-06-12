import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Placeholder for API service
const api = {
  getScores: async (limit = 10) => {
    console.log('Fetching scores...'); // Log for now
    // Simulate API call with richer data based on HTML preview
    return new Promise(resolve => setTimeout(() => {
      resolve([
        { id: 1, player_name: 'SerpentSage', score: 15200, created_at: new Date().toISOString() },
        { id: 2, player_name: 'PixelPilot', score: 13800, created_at: new Date().toISOString() },
        { id: 3, player_name: 'GliderPro', score: 12500, created_at: new Date().toISOString() },
        { id: 4, player_name: 'CodeCobra', score: 11200, created_at: new Date().toISOString() },
        { id: 5, player_name: 'ByteBoa', score: 10850, created_at: new Date().toISOString() },
        { id: 6, player_name: 'ReactRattler', score: 9900, created_at: new Date().toISOString() },
        { id: 7, player_name: 'Anonymous', score: 9500, created_at: new Date().toISOString() },
        { id: 8, player_name: 'JS_Jouster', score: 8700, created_at: new Date().toISOString() },
        { id: 9, player_name: 'LoopLegend', score: 8150, created_at: new Date().toISOString() },
        { id: 10, player_name: 'FastAPI_Fan', score: 7800, created_at: new Date().toISOString() },
      ]);
    }, 500));
    // Replace with actual API call: e.g., return axios.get(`/api/scores?limit=${limit}`);
  }
};

const ScoreboardPage = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const fetchedScores = await api.getScores(12); // Fetch top 12 scores
        setScores(fetchedScores);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch scores:', err);
        setError('Failed to load scores. Please try again later.');
        setScores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

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
      {error && <p className="text-brand-error text-xl">{error}</p>}
      
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
