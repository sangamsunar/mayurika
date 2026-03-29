import React, { useState } from 'react'
import axios from 'axios'
export const Login = () => {
  const [data, setData] = useState({
    email: '',
    password: ''
  })

   const loginUser = (e) => {
    e.preventDefault()
    axios.get('/')
   }
  return (
    <div>
        <form onSubmit={loginUser}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder='enter your email.' value = {data.email} onChange={(e) => setData({...data, email: e.target.value})}/>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder='enter your password.' value = {data.password} onChange={(e) => setData({...data, password: e.target.value})}/>
            <button type='submit'>Login</button>
        </form>
    </div>
  )
}

// {/* <p>Don't have an account? <Link to="/register">Register</Link></p> */}
// {/* <p>Forgot password? <Link to="/forgot-password">Forgot Password</Link></p> */}