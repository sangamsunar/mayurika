import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'


export const Register = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const registerUser = async (e) => {
    e.preventDefault()
    const { name, email, password } = data
    try {
      const { data: responseData } = await axios.post('/register', { name, email, password })
      if (responseData.error) {
        toast.error(responseData.error)
      } else {
        toast.success('OTP sent to your email!')
        navigate('/verify-email', { state: { email } })
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }
  return (
    <div>
      <form onSubmit={registerUser}>
        <label htmlFor="name">Full Name</label>
        <input type="text" required id="name" placeholder='enter your full name.' value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
        <label htmlFor="email" >Email</label>
        <input type="email" required id="email" placeholder='enter your email.' value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
        <label htmlFor="password" >Password</label>
        <input type="password" required id="password" placeholder='enter your password.' value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
        <button type='submit'>Submit</button>
        <Link to="/Login"><p>Already have an account? Login</p></Link>
      </form>
    </div>
  )
}
