import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GamePage from './pages/GamePage';
import ScoreboardPage from './pages/ScoreboardPage';

function App() {
  return (
    // This div ensures the app takes up available vertical space and allows pages to manage their own layout.
    <div className="flex-grow w-full flex flex-col">
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/scoreboard" element={<ScoreboardPage />} />
      </Routes>
    </div>
  );
}

export default App;
