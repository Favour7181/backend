const express = require('express');
const { register, login, validateRegister, validateLogin, verifyEmail, validateVerifyEmail } = require('../controllers/auth');
const authMiddleware = require("../middlewares/authMiddleware")
const {getUser} = require("../controllers/userController")



const router = express.Router();

router.get('/', (req, res) => {
    res.send('userRoute')
})

router.post('/register', validateRegister, register);
router.get('/verify-email/:token',validateVerifyEmail, verifyEmail);
router.post('/login', validateLogin, login )
router.get('/profile', authMiddleware, getUser)

module.exports = router;