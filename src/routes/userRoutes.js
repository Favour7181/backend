const express = require('express');
// const { register, login, validateRegister, validateLogin, verifyEmail, validateVerifyEmail } = require('../controllers/auth');
const authMiddleware = require("../middlewares/authMiddleware");
const { register, login, changePassword, updateProfile, deleteAccount, kycVerification } = require('../controllers/userController');
const { validateRegistration, validateLogin, validatePasswordChange, validateProfileUpdate, validateAccountDeletion, validateKYC } = require('../middlewares/validatorsMiddlewares');

const multer = require('multer');
const {cloudstorage} = require('../config/cloudinary')

const upload = multer({ cloudstorage });




const router = express.Router();

router.get('/', (req, res) => {
    res.send('userRoute')
})



// Register route
router.post('/register', validateRegistration, register);

// Login route
router.post('/login', validateLogin, login);

// Change Password route
router.put('/change-password', authMiddleware, validatePasswordChange, changePassword);

// Update Profile route
router.put('/update-profile', authMiddleware, validateProfileUpdate, updateProfile);

// Delete Account route
router.delete('/delete-account', authMiddleware, validateAccountDeletion, deleteAccount);

// KYC route
router.post('/kyc', authMiddleware, upload.single('selfie'), validateKYC, kycVerification);


module.exports = router;