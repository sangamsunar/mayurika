import React, { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'



export const Login = () => {
  const { setUser } = useContext(UserContext)
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
        setUser(data)
        toast.success('Logged in successfully!')

        setData({});
        navigate('/dashboard')

      }
    } catch (error) {
      toast.error('Something went wrong')
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