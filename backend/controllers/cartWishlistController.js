const User = require('../models/user')

// ── CART ──────────────────────────────

const addToCart = async (req, res) => {
    try {
        const { productId, selectedMetal, selectedPurity, selectedWeight } = req.body
        const user = await User.findById(req.user.id)

        const exists = user.cart.find(
            item => item.product.toString() === productId &&
            item.selectedMetal === selectedMetal &&
            item.selectedPurity === selectedPurity &&
            item.selectedWeight === selectedWeight
        )

        if (exists) {
            exists.quantity += 1
        } else {
            user.cart.push({ product: productId, selectedMetal, selectedPurity, selectedWeight })
        }

        await user.save()
        res.json({ message: 'Added to cart', cart: user.cart })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        user.cart = user.cart.filter(item => item._id.toString() !== req.params.itemId)
        await user.save()
        res.json({ message: 'Removed from cart', cart: user.cart })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product')
        res.json(user.cart)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// ── WISHLIST ──────────────────────────

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body
        const user = await User.findById(req.user.id)

        const exists = user.wishlist.find(item => item.product.toString() === productId)
        if (exists) {
            user.wishlist = user.wishlist.filter(item => item.product.toString() !== productId)
            await user.save()
            return res.json({ message: 'Removed from wishlist', wishlist: user.wishlist })
        }

        user.wishlist.push({ product: productId })
        await user.save()
        res.json({ message: 'Added to wishlist', wishlist: user.wishlist })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist.product')
        res.json(user.wishlist)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

module.exports = { addToCart, removeFromCart, getCart, addToWishlist, getWishlist }