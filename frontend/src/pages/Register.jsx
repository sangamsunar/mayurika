import React, { useState } from 'react'

export const Register = () => {
  const [data,setData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const registerUser = (e) => {
    e.preventDefault()
  }
  return (
    <div>
        <form onSubmit={registerUser}>
            <label htmlFor="name" placeholder='enter your full name..'>Full Name</label>
                <input type="text" id="name" placeholder='enter your full name.' value={data.name} onChange={(e) => setData({...data, name: e.target.value})}/>
            <label htmlFor="email" placeholder='enter your email.'>Email</label>
            <input type="email" id="email" placeholder='enter your email.' value={data.email} onChange={(e) => setData({...data, email: e.target.value})}/>
            <label htmlFor="password" placeholder='enter your password.'>Password</label>
            <input type="password" id="password" placeholder='enter your password.' value={data.password} onChange={(e) => setData({...data, password: e.target.value})}/>
            {/* <p>Already have an account? <Link to="/login">Login</Link></p> */}
        </form>
    </div>
  )
}
