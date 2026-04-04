import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'

export const VerifyEmail = () => {
    const navigate = useNavigate()
    const { state } = useLocation()
    const email = state?.email

    const [otp, setOtp] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { data } = await axios.post('/verify-email', { email, otp })
        if (data.error) {
            toast.error(data.error)
        } else {
            toast.success(data.message)
            navigate('/login')
        }
    }

    return (
        <div>
            <h2>Verify Your Email</h2>
            <p>OTP sent to <strong>{email}</strong></p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                />
                <button type="submit">Verify</button>
            </form>
        </div>
    )
}