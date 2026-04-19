const multer = require('multer')
const path = require('path')

const combinedStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'images') {
            cb(null, 'uploads/images')
        } else {
            cb(null, 'uploads/models')
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const combinedFilter = (req, file, cb) => {
    if (file.fieldname === 'images') {
        const allowedTypes = /jpeg|jpg|png|webp/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)
        if (extname && mimetype) {
            cb(null, true)
        } else {
            cb(new Error('Images only — jpeg, jpg, png, webp'))
        }
    } else if (file.fieldname === 'model') {
        const allowedTypes = /glb|gltf/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        if (extname) {
            cb(null, true)
        } else {
            cb(new Error('3D models only — .glb or .gltf'))
        }
    } else {
        cb(null, true)
    }
}

const upload = multer({
    storage: combinedStorage,
    fileFilter: combinedFilter,
    limits: {
        fileSize: 200 * 1024 * 1024  // 200MB
    }
})

// Avatar upload — separate multer instance
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/avatars'),
    filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const avatarFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Images only — jpeg, jpg, png, webp'))
    }
}
const avatarUpload = multer({ storage: avatarStorage, fileFilter: avatarFilter, limits: { fileSize: 5 * 1024 * 1024 } })

module.exports = { upload, avatarUpload }