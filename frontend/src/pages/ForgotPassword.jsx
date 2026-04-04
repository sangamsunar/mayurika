import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export const ForgotPassword = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await axios.post('/forgot-password', { email })
            if (data.error) {
                toast.error(data.error)
            } else {
                toast.success('OTP sent to your email!')
                // Pass email via navigation state so next page knows it
                navigate('/verify-otp', { state: { email } })
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
        setLoading(false)
    }

    return (
        <div>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                </button>
            </form>
        </div>
    )
}