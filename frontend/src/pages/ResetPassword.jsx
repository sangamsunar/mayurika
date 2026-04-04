import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'

export const ResetPassword = () => {
    const navigate = useNavigate()
    const { state } = useLocation()   // gets email + otp passed from VerifyOtp
    const { email, otp } = state || {}

    const [newPassword, setNewPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { data } = await axios.post('/reset-password', { email, otp, newPassword })
        if (data.error) {
            toast.error(data.error)
        } else {
            toast.success('Password reset! Please login.')
            navigate('/login')
        }
    }

    return (
        <div>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="submit">Reset Password</button>
            </form>
        </div>
    )
}