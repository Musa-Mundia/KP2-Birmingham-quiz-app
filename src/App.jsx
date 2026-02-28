import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './Components/LandingPage/LandingPage'
import LoginPage from './Components/LoginPage/LoginPage'
import DiffSelect from './Components/DifficultySelection/DiffSelect'
import Quiz from './Components/Quiz/Quiz'
import Scoreboard from './Components/Scoreboard/Scoreboard'


function App() {
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('member')

  // callback to handle login from LoginPage
  const handleLogin = (name, role) => {
    setUserName(name)
    setUserRole(role || 'member')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/difficulty" element={<DiffSelect userName={userName} userRole={userRole} />} />
        <Route path="/quiz/:difficulty" element={<Quiz userName={userName} userRole={userRole} />} />
        <Route path="/quiz" element={<Quiz userName={userName} userRole={userRole} />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App