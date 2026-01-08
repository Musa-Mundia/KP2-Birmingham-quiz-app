import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import './LoginPage.css'

function LoginPage({ onLogin })  {
    const navigate = useNavigate()
    const [userName, setuserName] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function submit(e) {
        e.preventDefault();
        
        if (!userName || !password) {
            setError("Please enter both username and password");
            return;
        }

        setLoading(true);
        setError('');

        try{
            console.log('Attempting login with:', { userId: userName, password });
            const res = await axios.post("http://localhost:5000/api/login",{
                userId: userName,
                password: password
            })
            
            console.log('Login response:', res.data);
            if(res.data.success){
                if (onLogin) onLogin(userName);
                navigate("/difficulty",{state:{userName:userName}})
            } else {
                setError(res.data.message || "Login failed");
            }
        }
        catch(e){
            console.error('Login error:', e);
            if (e.response?.data?.message) {
                setError(e.response.data.message);
            } else if (e.code === 'ERR_NETWORK') {
                setError("Cannot connect to server. Make sure the backend is running on port 5000");
            } else {
                setError("Login failed. Please try again.")
            }
        }
        finally {
            setLoading(false);
        }
    }
        
   

// Page code
    return(
    <div className="bg-fuchsia-600 min-h-screen flex items-center justify-center">
        <div className='container'>
            <form onSubmit={submit}>
                <div className="header">
                    <div className="text">Login</div>
                     <div className="underline"></div>
                </div>
                {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '5px' }}>
                    {error}
                </div>}
                <div className="inputs">
                    <div className="input">
                        <input type="text" placeholder='Username' value={userName}
                         onChange={(e) => setuserName(e.target.value)} disabled={loading}
                         required>
                        </input>
                    </div>
                    <div className="input">
                        <input type="password" placeholder='Password' value={password} 
                        onChange={(e) => setPassword(e.target.value)} disabled={loading}
                        required>
                        </input>
                    </div>
                </div>
                <div className='submit-container'>
                    <button type="submit" className="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
                <div className='submit-container' style={{ marginTop: '10px' }}>
                    <button type="button" className="submit" onClick={() => navigate('/')} 
                        style={{ backgroundColor: '#6b7280' }}>
                        Exit
                    </button>
                </div>
            </form>
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                {/* <p>Test Credentials:</p>
                <p>user1 / password123</p>
                <p>user2 / quiz2025</p> */}
            </div>
        </div>
    </div>
    )
}

export default LoginPage