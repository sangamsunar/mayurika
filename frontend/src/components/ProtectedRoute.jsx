import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { UserContext } from '../../context/userContext'

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext)
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  return children
}

export const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext)
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  return children
}
