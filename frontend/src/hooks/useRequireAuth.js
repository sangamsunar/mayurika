import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import { toast } from 'react-hot-toast'

export const useRequireAuth = () => {
    const { user } = useContext(UserContext)
    const navigate = useNavigate()

    const guardAction = (action) => {
        if (!user) {
            toast.error('Please login or register to continue')
            navigate('/login')
            return
        }
        action() // if logged in, run the actual action
    }

    return { guardAction }
}