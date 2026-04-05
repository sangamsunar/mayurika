const jwt = require('jsonwebtoken')

// Checks if user is logged in
const requireAuth = (req, res, next) => {
    const { token } = req.cookies
    if (!token) {
        return res.json({ error: 'Not authenticated. Please login.' })
    }
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
        if (err) return res.json({ error: 'Invalid token. Please login again.' })
        req.user = user
        next()
    })
}

// Checks if user is admin
const requireAdmin = (req, res, next) => {
    const { token } = req.cookies
    if (!token) {
        return res.json({ error: 'Not authenticated.' })
    }
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
        if (err) return res.json({ error: 'Invalid token.' })
        if (user.role !== 'admin') {
            return res.json({ error: 'Access denied. Admins only.' })
        }
        req.user = user
        next()
    })
}

module.exports = { requireAuth, requireAdmin }