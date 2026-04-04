import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'


export const Login = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({
    email: '',
    password: ''
  })

  const loginUser = async (e) => {
    e.preventDefault()
    const { email, password } = data
    try {
      const { data } = await axios.post('/login', {
        email,
        password
      });
      if (data.error) {
        toast.error(data.error)
      } else {
        setData({});
        navigate('/dashboard')

      }
    } catch (error) {

    }
  }
  return (
    <div>
      <form onSubmit={loginUser}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" placeholder='enter your email.' value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" placeholder='enter your password.' value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
        <button type='submit'>Login</button>
        <Link to="/forgot-password">Forgot Password</Link>
        <p>Don't have an account? <Link to="/register">Register</Link></p>

      </form>
    </div>
  )
}