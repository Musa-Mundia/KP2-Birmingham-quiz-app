import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../config'
import './Quiz.css'
import { questions as easyQuestions } from '../../assets/data(bible-quesitons)'
import { mediumQuestions } from '../../assets/data(Church-History)'
import { hardQuestions } from '../../assets/data(K-questions)'

// Imports and state variable section

const Quiz = ({ userName, onLogout }) => {
  const navigate = useNavigate()
  const { difficulty } = useParams()
  const location = useLocation()

  // Difficulty configurations
  const difficultyConfig = {
    easy: { questionCount: 20, timePerQuestion: 25 },
    medium: { questionCount: 20, timePerQuestion: 20 },
    hard: { questionCount: 20, timePerQuestion: 15 }
  }

  const config = difficultyConfig[difficulty] || difficultyConfig.easy
  const currentDifficulty = difficulty || 'easy'

  // Select questions based on difficulty
  const getQuestionsForDifficulty = () => {
    switch (currentDifficulty) {
      case 'medium':
        return mediumQuestions.slice(0, Math.min(config.questionCount, mediumQuestions.length))
      case 'hard':
        return hardQuestions.slice(0, Math.min(config.questionCount, hardQuestions.length))
      case 'easy':
      default:
        return easyQuestions.slice(0, Math.min(config.questionCount, easyQuestions.length))
    }
  }

  const quizQuestions = getQuestionsForDifficulty()

  // Check if resuming
  const shouldResume = location.state?.resume

  // Load saved progress or start fresh
  const loadInitialState = () => {
    if (shouldResume) {
      const saved = localStorage.getItem(`quiz_progress_${currentDifficulty}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          index: parsed.index || 0,
          revealed: parsed.revealed || [],
          selectedOpt: parsed.selectedOpt || null,
          selectedCorrect: parsed.selectedCorrect || null,
          lock: parsed.lock || false,
          score: parsed.score || 0,
          result: parsed.result || false,
          timeLeft: parsed.timeLeft || config.timePerQuestion
        }
      }
    }
    return {
      index: 0,
      revealed: [],
      selectedOpt: null,
      selectedCorrect: null,
      lock: false,
      score: 0,
      result: false,
      timeLeft: config.timePerQuestion
    }
  }

  const initialState = loadInitialState()

  let [index, setIndex] = useState(initialState.index)
  let [revealed, setRevealed] = useState(initialState.revealed)
  let [selectedOpt, setSelectedOpt] = useState(initialState.selectedOpt)
  let [selectedCorrect, setSelectedCorrect] = useState(initialState.selectedCorrect)
  let [lock, setLock] = useState(initialState.lock)
  let [score, setScore] = useState(initialState.score)
  let [result, setResult] = useState(initialState.result)
  let [timeLeft, setTimeLeft] = useState(initialState.timeLeft)
  let [showExitModal, setShowExitModal] = useState(false)

  // Save progress whenever state changes
  useEffect(() => {
    if (!result) {
      const progressData = {
        index,
        revealed,
        selectedOpt,
        selectedCorrect,
        lock,
        score,
        result,
        timeLeft
      }
      localStorage.setItem(`quiz_progress_${currentDifficulty}`, JSON.stringify(progressData))
    }
  }, [index, revealed, selectedOpt, selectedCorrect, lock, score, result, timeLeft, currentDifficulty])

  // Timer effect
  useEffect(() => {
    if (result || lock) return; 
    
    if (timeLeft <= 0) {
      // Time's up move to next question
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result, lock]);

  // Reset timer when moving to next question
  useEffect(() => {
    setTimeLeft(config.timePerQuestion);
  }, [index]);

  // Debug logging
  console.log('Quiz Debug:', { 
    difficulty, 
    currentDifficulty, 
    questionsLength: quizQuestions.length, 
    index,
    question: quizQuestions[index]
  });

  const question = quizQuestions[index]
  if (!question) {
    return (
      <div className="quiz-container">
        <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
          <h2>Loading Quiz...</h2>
          <p>Difficulty: {currentDifficulty}</p>
          <p>Questions loaded: {quizQuestions.length}</p>
          <p>Current index: {index}</p>
          {quizQuestions.length === 0 && <p style={{color: 'yellow'}}>No questions found for this difficulty!</p>}
        </div>
      </div>
    )
  }

 
  const isNewFormat = Array.isArray(question.options)

  
  const getQuestionText = () => {
    return question.text || question.question
  }

  // Get the correct option number (1-4) based on the answer field
  const getCorrectOption = () => {
    if (isNewFormat) {
      // New format: find index of correctAnswer in options array
      const idx = question.options.findIndex(opt => opt === question.correctAnswer)
      return idx >= 0 ? idx + 1 : null
    }
   
    const answer = question.answer
    if (answer === 'A') return 1
    if (answer === 'B') return 2
    if (answer === 'C') return 3
    if (answer === 'D') return 4
    return null
  }

  const isRevealed = (optNum) => revealed.includes(optNum)

  // Hide scripture references (text in parentheses) until answer is revealed
  const hideScriptureReferences = (text) => {
    if (!text) return ''
    // Early issue where scripture would show regardless using '' Removed it
    return text.replace(/\s*\([^)]*\)/g, '')
  }

  
  // Scripture references are hidden until the answer is locked/revealed
  const displayOptionText = (optNum) => {
    let optionText = ''
    if (isNewFormat) {
      const letters = ['A', 'B', 'C', 'D']
      optionText = `${letters[optNum - 1]}. ${question.options[optNum - 1] || ''}`
    } else {
      optionText = question[`option${optNum}`] || ''
    }
    
    // Only show scripture references after the answer is locked
    if (!lock) {
      return hideScriptureReferences(optionText)
    }
    return optionText
  }

  const lockAnswers = () => setLock(true)


  const checkAns = (_e, ans) => {
    if (lock) return

    const correct = getCorrectOption()
    const isCorrect = ans === correct

    // Mark which options have been revealed
    setRevealed(prev => {
      const updated = new Set(prev)
      updated.add(ans)
      if (!isCorrect) {
        updated.add(correct) // Also reveal the correct option if they got it wrong
      }
      return Array.from(updated)
    })

    setSelectedOpt(ans)
    setSelectedCorrect(isCorrect)
    lockAnswers()

    if (isCorrect) setScore(s => s + 1) 
  }

  const revealAnswerOnTimeout = () => {
    if (lock) return;

    const correct = getCorrectOption();

    if (correct) {
      setRevealed(prev => Array.from(new Set([...prev, correct])));
    }

    // Highlight the correct answer with "wrong" styling (user didn't select it)
    setSelectedOpt(correct);
    setSelectedCorrect(false);
    lockAnswers();
  };

  useEffect(() => {
    if (timeLeft === 0 && !lock && selectedOpt === null) {
      revealAnswerOnTimeout();
    }
  }, [timeLeft, lock, selectedOpt]);

  // Potential function not emplemented yet as suitable sound is yet to be selected.
  useEffect(() => {
    if (timeLeft === 5 && !result) {
      const audio = new Audio('/warning-sound.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
  }, [timeLeft, result]);

  // Save score to backend
  const saveScore = async (finalScore) => {
    if (!userName) {
      console.log('No username, skipping score save');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/scores`, {
        userId: userName,
        difficulty: currentDifficulty,
        score: finalScore,
        totalQuestions: quizQuestions.length
      });
      console.log('Score saved successfully');
    } catch (e) {
      console.error('Failed to save score:', e);
    }
  };

  const handleNext = () => {
    if (!lock) return
    setLock(false)
    if (index === quizQuestions.length - 1){
      // Calculate final score (current score + 1 if last answer was correct)
      const finalScore = selectedCorrect ? score + 1 : score;
      setResult(true)
      // Clear saved progress when quiz is complete
      localStorage.removeItem(`quiz_progress_${currentDifficulty}`)
      // Save score to backend
      saveScore(finalScore);
      return
    }
    setIndex(i => Math.min(i + 1, quizQuestions.length - 1))
    setRevealed([])
    setSelectedOpt(null)
    setSelectedCorrect(null)
  }

  // restart quiz
  const restart = () => {
    setIndex(0)
    setScore(0)
    setRevealed([])
    setSelectedOpt(null)
    setSelectedCorrect(null)
    setResult(false)
    setLock(false)
    setTimeLeft(config.timePerQuestion)
    // Clear saved progress on restart
    localStorage.removeItem(`quiz_progress_${currentDifficulty}`)
  }

  const correctOpt = getCorrectOption()
  
  // Calculate circular progress bar - starts full and decreases clockwise
  const totalTime = config.timePerQuestion;
  const progress = (timeLeft / totalTime) * 100;  // Inverted: full at start, empty at end
  const radius = 55;  
  const circumference = 2 * Math.PI * radius; 
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Capitalize difficulty for display
  const difficultyDisplay = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)

  return (
    <div className="quiz-container">
      <header>
        <h1>KP2 Birmingham Quiz</h1>
        <h2>Difficulty: {difficultyDisplay} • {quizQuestions.length} Questions</h2>
        <hr />
      </header>

      {result ? (
        <div className="results">
          <h2>Quiz Complete!</h2>
          <div className="final-score">
            <h1>{score}</h1>
            <p>out of {quizQuestions.length}</p>
          </div>
          <p className="score-message">
            {score === quizQuestions.length
              ? 'Perfect score! One Mighty in Scripture!'
              : score >= quizQuestions.length * 0.8
              ? 'Great job! You did really well!'
              : score >= quizQuestions.length * 0.6
              ? 'Its time to put your face in the book!!'
              : ' Keep practicing! to improve your score!'}
          </p>
          <div className="results-buttons">
            <button onClick={restart}>Restart</button>
            <button onClick={() => navigate('/difficulty')} className="logout-btn">Change Difficulty</button>
            <button onClick={() => navigate('/')} className="logout-btn">Exit Quiz</button>
          </div>
        </div>
      ) : (
        <div className="content">
          {/* Timer with Circular Progress */}
          <div className="timer-container">
            <svg width="130" height="130" className={`circular-progress ${timeLeft <= 5 ? 'throb' : ''}`}>
              <circle
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="20"
              />
              <circle
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke={timeLeft <= 5 ? '#ff4444' : timeLeft <= 12 ? '#ffaa00' : '#4CAF50'}
                strokeWidth="17"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.1s linear', transform: 'rotate(+90deg) scaleX(-1)', transformOrigin: '65px 65px' }}
              />
              <text x="65" y="75" textAnchor="middle" fontSize="32" fontWeight="bold" fill={timeLeft <= 5 ? '#ff4444' : timeLeft <= 12 ? '#ffaa00' : '#333'}>
                {timeLeft}s
              </text>
            </svg>
          </div>

          <section className='question-box'>
            <div className="question-number">Question {index + 1} of {quizQuestions.length}</div>
            <h2>{getQuestionText()}</h2>
          </section>

          <div className='Questions'>
            <ul>
              {[1,2,3,4].map(i => (
                <li
                  key={i}
                  className={
                    selectedOpt === i
                      ? (selectedCorrect ? 'correct' : 'wrong')
                      : (selectedOpt && !selectedCorrect && correctOpt === i ? 'correct' : '')
                  }
                  onClick={(e)=>{checkAns(e,i)}}
                >
                  {displayOptionText(i)}
                </li>
              ))}
            </ul>
       </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={handleNext}>Next</button>
            <button onClick={() => setShowExitModal(true)} className="exit-btn">
              Exit
            </button>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Are you sure you want to exit?</h2>
            <p>You will lose your current progress.</p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowExitModal(false)}
                className="modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/difficulty')}
                className="modal-btn-exit"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quiz