import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './Components/LandingPage/LandingPage'
import LoginPage from './Components/LoginPage/LoginPage'
import DiffSelect from './Components/DifficultySelection/DiffSelect'
import Quiz from './Components/Quiz/Quiz'
import Scoreboard from './Components/Scoreboard/Scoreboard'


function App() {
  const [userName, setUserName] = useState('')

  // callback to handle login from LoginPage
  const handleLogin = (name) => {
    setUserName(name)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/difficulty" element={<DiffSelect userName={userName} />} />
        <Route path="/quiz/:difficulty" element={<Quiz userName={userName} />} />
        <Route path="/quiz" element={<Quiz userName={userName} />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App