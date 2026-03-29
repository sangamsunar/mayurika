const express = require('express');
const router = express.Router() //Router() is a function that allows us to use with epxress framework
const cors =require('cors')
const {test, registerUser} = require('../controllers/authController')
//middleware
router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
)

router.get('/', test )
router.post('/register', registerUser)

module.exports = router