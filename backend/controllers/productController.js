const Product = require('../models/product')

// Get all products
const getProducts = async (req, res) => {
    try {
        const { category, style, gender, ageGroup, inStock, metal, search } = req.query
        const filter = {}

        if (category) filter.category = category
        if (style) filter['style.type'] = style
        if (gender) filter.gender = gender
        if (ageGroup) filter.ageGroup = ageGroup
        if (inStock) filter.inStock = inStock === 'true'
        if (metal) filter.metalOptions = { $in: [metal] }

        // Text search on name and description
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
            ]
        }

        const products = await Product.find(filter).sort({ createdAt: -1 })
        res.json(products)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// Get single product
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.json({ error: 'Product not found' })
        res.json(product)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// Create product — admin only
const createProduct = async (req, res) => {
    try {
        const {
            name, description, category, style, occasion,
            gender, ageGroup, metalOptions, purityOptions,
            minWeightTola, maxWeightTola, makingChargePerTola,
            jartiAmount, stoneCharge, measurementType,
            isTraditional, hallmark, customizable,
            pickupAvailable, region, inStock
        } = req.body

        // Validate required fields
        if (!name || !description || !category || !gender) {
            return res.json({ error: 'Name, description, category and gender are required' })
        }
        if (!minWeightTola || !maxWeightTola || !makingChargePerTola) {
            return res.json({ error: 'Weight range and making charge are required' })
        }
        if (parseFloat(minWeightTola) >= parseFloat(maxWeightTola)) {
            return res.json({ error: 'Max weight must be greater than min weight' })
        }

        // Handle uploaded images
        const images = req.files?.images
            ? req.files.images.map(file => `/uploads/images/${file.filename}`)
            : []

        // Handle uploaded 3D model
        const model3D = req.files?.model
            ? `/uploads/models/${req.files.model[0].filename}`
            : null

        const product = await Product.create({
            name,
            description,
            category,
            style: JSON.parse(style),
            occasion,
            gender,
            ageGroup,
            metalOptions: JSON.parse(metalOptions),
            purityOptions: JSON.parse(purityOptions),
            minWeightTola: parseFloat(minWeightTola),
            maxWeightTola: parseFloat(maxWeightTola),
            makingChargePerTola: parseFloat(makingChargePerTola),
            jartiAmount: parseFloat(jartiAmount) || 0,
            stoneCharge: parseFloat(stoneCharge) || 0,
            measurementType,
            images,
            model3D,
            isTraditional: isTraditional === 'true',
            hallmark: hallmark === 'true',
            customizable: customizable === 'true',
            pickupAvailable: pickupAvailable === 'true',
            region,
            inStock: inStock === 'true'
        })

        res.json(product)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// Update product — admin only
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.json({ error: 'Product not found' })

        // Handle new images if uploaded
        const newImages = req.files?.images
            ? req.files.images.map(file => `/uploads/images/${file.filename}`)
            : product.images

        // Handle new 3D model if uploaded
        const newModel = req.files?.model
            ? `/uploads/models/${req.files.model[0].filename}`
            : product.model3D

        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                style: req.body.style ? JSON.parse(req.body.style) : product.style,
                metalOptions: req.body.metalOptions ? JSON.parse(req.body.metalOptions) : product.metalOptions,
                purityOptions: req.body.purityOptions ? JSON.parse(req.body.purityOptions) : product.purityOptions,
                images: newImages,
                model3D: newModel
            },
            { returnDocument: 'after' }
        )

        res.json(updated)
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

// Delete product — admin only
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.json({ error: 'Product not found' })

        await Product.findByIdAndDelete(req.params.id)
        res.json({ message: 'Product deleted successfully' })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}