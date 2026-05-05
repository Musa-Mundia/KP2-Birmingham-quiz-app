import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DifficultySelection({ userName, userRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = userRole || location.state?.userRole || 'member';
  const memberAllowedModes = ['easy', 'medium', 'hard'];
  const restrictedAllowedModes = ['hard', 'leader', 'mentor'];
  const isLeader = role.toLowerCase() === 'leader';
  const isMentor = role.toLowerCase() === 'mentor';
  const isRestricted = isLeader || isMentor;

  const difficulties = [
    {
      id: 'easy',
      title: 'Easy',
      description: '20 questions • 25 seconds each',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      icon: '😊'
    },
    {
      id: 'medium',
      title: 'Medium',
      description: '25 questions • 20 seconds each',
      color: 'from-yellow-500 to-yellow-600',
      hoverColor: 'hover:from-yellow-600 hover:to-yellow-700',
      icon: '🤔'
    },
    {
      id: 'hard',
      title: 'Hard',
      description: '22 questions • 15 seconds each',
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      icon: '🔥'
    },
    {
      id: 'leader',
      title: 'Leader',
      description: '20 questions • 15 seconds each',
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      icon: '👑'
    },
    {
      id: 'mentor',
      title: 'Mentor',
      description: '30 questions • 10 seconds each',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      icon: '🧠'
    }
  ];

  const availableDifficulties = isRestricted
    ? difficulties.filter((diff) => restrictedAllowedModes.includes(diff.id))
    : difficulties.filter((diff) => memberAllowedModes.includes(diff.id));

  const handleDifficultySelect = (difficulty) => {
    // Check if there's a saved quiz progress for this difficulty
    const savedProgress = localStorage.getItem(`quiz_progress_${difficulty}`);

    if (savedProgress && !isLeader) { // Resume quiz or start new
      
      const resume = window.confirm(
        'You have an unfinished quiz. Would you like to resume? Click OK to resume or Cancel to start fresh.'
      );
      
      if (resume) {
        navigate(`/quiz/${difficulty}`, { state: { resume: true } });
      } else {
        // Clear saved progress and start fresh
        localStorage.removeItem(`quiz_progress_${difficulty}`);
        navigate(`/quiz/${difficulty}`, { state: { resume: false } });
      }
    } else {
      if (isLeader) {
        // Leaders should always start fresh and never resume.
        localStorage.removeItem(`quiz_progress_${difficulty}`);
        localStorage.removeItem(`quiz_questions_${difficulty}`);
      }
      navigate(`/quiz/${difficulty}`, { state: { resume: false } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">Select Difficulty</h1>
        <p className="text-xl text-purple-200">Choose your challenge level</p>
      </div>

      {/* Difficulty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl w-full mb-8">
        {availableDifficulties.map((diff) => (
          <button
            key={diff.id}
            onClick={() => handleDifficultySelect(diff.id)}
            className={`bg-gradient-to-br ${diff.color} ${diff.hoverColor} rounded-3xl p-8 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl`}
          >
            <div className="text-6xl mb-4">{diff.icon}</div>
            <h2 className="text-3xl font-bold mb-3">{diff.title}</h2>
            <p className="text-lg opacity-90">{diff.description}</p>
            
            {/* Show "Resume Available" badge if there's saved progress */}
            {!isLeader && localStorage.getItem(`quiz_progress_${diff.id}`) && (
              <div className="mt-4 bg-black bg-opacity-20 rounded-full px-4 py-2 text-sm font-semibold">
                📌 Resume Available
              </div>
            )}
          </button>
        ))}
      </div>

      
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => navigate('/scoreboard')}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          🏆 View Scoreboard
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-black bg-opacity-20 hover:bg-opacity-30 text-white rounded-full font-semibold transition-all duration-200"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}