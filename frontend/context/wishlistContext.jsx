import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { UserContext } from './userContext'

export const WishlistContext = createContext({ ids: new Set(), toggle: () => {} })

export function WishlistContextProvider({ children }) {
  const { user } = useContext(UserContext)
  const [ids, setIds] = useState(new Set())

  useEffect(() => {
    if (!user) { setIds(new Set()); return }
    axios.get('/wishlist').then(({ data }) => {
      if (!data.error) {
        setIds(new Set(data.map(item => item.product?._id || item.product)))
      }
    }).catch(() => {})
  }, [user])

  const toggle = useCallback(async (productId) => {
    setIds(prev => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
    try {
      await axios.post('/wishlist', { productId })
    } catch {
      // revert on failure
      setIds(prev => {
        const next = new Set(prev)
        if (next.has(productId)) next.delete(productId)
        else next.add(productId)
        return next
      })
    }
  }, [])

  return (
    <WishlistContext.Provider value={{ ids, toggle }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
