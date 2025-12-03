import React, { useState } from 'react'
import './Quiz.css'
import { questions } from '../../assets/data'

const Quiz = () => {
  let [index, setIndex] = useState(0)
  let [revealed, setRevealed] = useState([])
  let [selectedOpt, setSelectedOpt] = useState(null)
  let [selectedCorrect, setSelectedCorrect] = useState(null)
  let [lock, setLock] = useState(false)

  // Move this AFTER state declarations so it updates when index changes
  const question = questions[index]

  if (!question) return <div className="quiz-container">Loading...</div>

  const isRevealed = (optNum) => revealed.includes(`${index}-${optNum}`)

  const displayOptionText = (optNum) => {
    const raw = question[`option${optNum}`] || ''
    if (isRevealed(optNum)) return raw
    return raw.replace(/\s*\([^)]+\)/, '') // removes entirely
  }

  const lockAnswers = () => setLock(true)
  const unlockAnswers = () => setLock(false)

  const getCorrectOption = () => {
    for (let i = 1; i <= 4; i++) {
      const optText = question[`option${i}`] || ''
      if (/\([^)]+\)/.test(optText)) return i
    }
    return null
  }

  const checkAns = (_e, ans) => {
    if (!lock) {
      const optText = question[`option${ans}`] || ''
      const hasVerse = /\([^)]+\)/.test(optText)
      const key = `${index}-${ans}`

      console.log('Clicked:', key, 'hasVerse:', hasVerse, 'optText:', optText)

      lockAnswers()
      setRevealed(prev => {
        const updated = prev.includes(key) ? prev : [...prev, key]
        console.log('Revealed after:', updated)
        return updated
      })
      setSelectedOpt(ans)
      setSelectedCorrect(hasVerse)
    }
  }

  const handleNext = () => {
    setIndex(i => Math.min(i + 1, questions.length - 1))
    setRevealed([])
    setSelectedOpt(null)
    setSelectedCorrect(null)
    unlockAnswers()
  }

  const correctOpt = getCorrectOption()

  return (
    <div className='quiz-container'>
      <header>
        <h1>KP2 Birmingham Quiz</h1>
        <h2>Section: General Bible Questions</h2>
        <hr/>
      </header>

      <div className="content">
        <section className='question-box'>
          <h2>{question.id}. {question.text}</h2>
        </section>

        <div className='Questions'>
          <ul>
            <li
              className={
                selectedOpt === 1
                  ? (selectedCorrect ? 'correct' : 'wrong')
                  : (selectedOpt && !selectedCorrect && correctOpt === 1 ? 'correct' : '')
              }
              onClick={(e)=>{checkAns(e,1)}}
            >
              {displayOptionText(1)}
            </li>

            <li
              className={
                selectedOpt === 2
                  ? (selectedCorrect ? 'correct' : 'wrong')
                  : (selectedOpt && !selectedCorrect && correctOpt === 2 ? 'correct' : '')
              }
              onClick={(e)=>{checkAns(e,2)}}
            >
              {displayOptionText(2)}
            </li>

            <li
              className={
                selectedOpt === 3
                  ? (selectedCorrect ? 'correct' : 'wrong')
                  : (selectedOpt && !selectedCorrect && correctOpt === 3 ? 'correct' : '')
              }
              onClick={(e)=>{checkAns(e,3)}}
            >
              {displayOptionText(3)}
            </li>

            <li
              className={
                selectedOpt === 4
                  ? (selectedCorrect ? 'correct' : 'wrong')
                  : (selectedOpt && !selectedCorrect && correctOpt === 4 ? 'correct' : '')
              }
              onClick={(e)=>{checkAns(e,4)}}
            >
              {displayOptionText(4)}
            </li>
          </ul>
        </div>

        <button onClick={handleNext}>Next</button>
        <div className="index">{index + 1} of {questions.length} Questions</div>
      </div>
    </div>
  )
}

export default Quiz