import { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import { toast } from 'react-hot-toast'

export const useRequireAuth = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const location = useLocation()

  const guardAction = (action) => {
    if (!user) {
      toast.error('Please login to continue')
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    action()
  }

  return { guardAction }
}
