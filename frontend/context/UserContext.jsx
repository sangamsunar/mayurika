import axios from 'axios'
import { createContext, useState, useEffect } from 'react'

export const UserContext = createContext({})

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)  // ← add loading state

    useEffect(() => {
        axios.get('/profile').then(({ data }) => {
            setUser(data)
            setLoading(false)
        })
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    )
}