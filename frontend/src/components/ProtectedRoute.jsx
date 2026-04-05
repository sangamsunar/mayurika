import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'

// For logged in users only
export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(UserContext)

    if (loading) return <div>Loading...</div>
    if (!user) return <Navigate to="/login" />

    return children
}

// For admins only
export const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(UserContext)

    if (loading) return <div>Loading...</div>
    if (!user) return <Navigate to="/login" />
    if (user.role !== 'admin') return <Navigate to="/" />

    return children
}