import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Scoreboard() {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const difficulties = [
    { id: 'all', label: 'All Difficulties' },
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' }
  ];

  useEffect(() => {
    fetchScores();
  }, [selectedDifficulty]);

  const fetchScores = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/scoreboard?difficulty=${selectedDifficulty}`);
      if (response.data.success) {
        setScores(response.data.scores);
      }
    } catch (e) {
      console.error('Error fetching scores:', e);
      setError('Failed to load scoreboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-purple-500';
    }
  };

  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '🤔';
      case 'hard': return '🔥';
      default: return '📊';
    }
  };

  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex flex-col items-center p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-4">🏆 Scoreboard</h1>
        <p className="text-xl text-purple-200">See who's leading the quiz!</p>
      </div>

      {/* Difficulty Filter */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {difficulties.map((diff) => (
          <button
            key={diff.id}
            onClick={() => setSelectedDifficulty(diff.id)}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
              selectedDifficulty === diff.id
                ? 'bg-black text-purple-700 shadow-lg'
                : 'bg-black bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {/* Scoreboard Table */}
      <div className="w-full max-w-3xl bg-black bg-opacity-10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
        {loading ? (
          <div className="text-center text-white py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-xl">Loading scores...</p>
          </div>
        ) : error ? (
          <div className="text-center text-white py-12">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-xl text-red-300">{error}</p>
            <button
              onClick={fetchScores}
              className="mt-4 px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
            >
              Retry
            </button>
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center text-white py-12">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-xl">No scores yet!</p>
            <p className="text-purple-200 mt-2">Be the first to complete a quiz!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-purple-200 text-left border-b border-white border-opacity-20">
                  <th className="py-4 px-4">Rank</th>
                  <th className="py-4 px-4">Player</th>
                  <th className="py-4 px-4">Difficulty</th>
                  <th className="py-4 px-4 text-center">Score</th>
                  <th className="py-4 px-4 text-center">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, index) => (
                  <tr
                    key={`${entry.userId}-${entry.difficulty}-${index}`}
                    className={`bg-white text-black border-b border-white border-opacity-10 transition-all hover:bg-white hover:bg-opacity-10 ${
                      index < 3 ? 'text-lg font-semibold' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <span className={index < 3 ? 'text-2xl' : ''}>
                        {getRankEmoji(index)}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">{entry.userId}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getDifficultyColor(entry.difficulty)} text-white`}>
                        {getDifficultyEmoji(entry.difficulty)} {entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {entry.score}/{entry.totalQuestions}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${
                        (entry.score / entry.totalQuestions) >= 0.8 ? 'text-green-400' :
                        (entry.score / entry.totalQuestions) >= 0.6 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {Math.round((entry.score / entry.totalQuestions) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/difficulty')}
        className="mt-8 px-8 py-3 bg-black bg-opacity-20 hover:bg-opacity-30 text-white rounded-full font-semibold transition-all duration-200"
      >
        ← Back to Difficulty Selection
      </button>
    </div>
  );
}
