import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // Show welcome for 2 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      setShowContent(true);
      generateConfetti();
    }, 2000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  const generateConfetti = () => {
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 2,
        animationDuration: 3 + Math.random() * 2,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 6)]
      });
    }
    setConfetti(pieces);
  };

  const handleStart = () => {
    console.log('Starting quiz...');
    navigate('/login');
  };

  const handleExit = () => {
    console.log('Exiting...');
    window.close();
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-400 via-fuchsia-500
       to-fuchsia-600 flex items-center justify-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold
         text-white animate-pulse text-center">
          Welcome!!
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-400 via-fuchsia-500 
    to-fuchsia-600 flex items-center justify-center px-4 py-8 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Confetti function */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 sm:w-3 sm:h-3 opacity-80"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animation: `fall ${piece.animationDuration}s linear ${piece.animationDelay}s infinite`,
            transform: 'rotate(45deg)'
          }}
        />
      ))}

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className={`w-full max-w-sm sm:max-w-md mx-auto relative z-10 ${showContent ? 'animate-fadeIn' : 'opacity-0'}`}>
        {/* Welcome Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Welcome!!
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl 
        p-6 sm:p-8 mb-6 sm:mb-8 transform transition-all duration-500 hover:scale-105">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
            KP2 Birmingham
          </h2>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center">
            Leadership Competency Quiz
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full bg-yellow-500 hover:bg-yellow-600 
            active:bg-yellow-700 text-white font-bold text-lg sm:text-xl py-3 
            sm:py-4 px-6 sm:px-8 rounded-full shadow-lg transition duration-300 #
            transform hover:scale-105 active:scale-95">
            Start Your Journey
          </button>

          {/* Exit Button */}
          <button
            onClick={handleExit}
            className="w-full bg-gray-500 hover:bg-gray-600 
            active:bg-gray-700 text-white font-bold text-lg 
            sm:text-xl py-3 sm:py-4 px-6 sm:px-8 rounded-full 
            shadow-lg transition duration-300 transform hover:scale-105
             active:scale-95">
            Exit
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
