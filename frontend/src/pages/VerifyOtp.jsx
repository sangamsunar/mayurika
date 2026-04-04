import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'

export const VerifyOtp = () => {
    const navigate = useNavigate()
    const { state } = useLocation()   // gets email passed from ForgotPassword
    const email = state?.email

    const [otp, setOtp] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { data } = await axios.post('/verify-otp', { email, otp })
        if (data.error) {
            toast.error(data.error)
        } else {
            toast.success('OTP verified!')
            navigate('/reset-password', { state: { email, otp } })
        }
    }

    return (
        <div>
            <h2>Enter OTP</h2>
            <p>OTP sent to {email}</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                />
                <button type="submit">Verify OTP</button>
            </form>
        </div>
    )
}