const { check, validationResult } = require('express-validator');


const validateRegistration = [
    check('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    check('name').trim().notEmpty().withMessage('Name is required').escape(),
  ];

const validateLogin = [
    check('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    check('password').notEmpty().withMessage('Password is required').escape(),
  ];

const validatePasswordChange = [
    check('oldPassword').notEmpty().withMessage('Old password is required').escape(),
    check('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
    check('confirmPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
  ];

const validateProfileUpdate = [
    check('name').trim().notEmpty().withMessage('Name is required').escape(),
    check('number').isMobilePhone().withMessage('Please provide a valid phone number').optional(),
  ];

const validateAccountDeletion = [
    check('password').notEmpty().withMessage('Password is required for account deletion').escape(),
  ];
  
const validateKYC = [
    check('bvn').isLength({ min: 11, max: 11 }).withMessage('BVN must be 11 digits').isNumeric(),
  ];
  
module.exports = {
    validateRegistration,
    validateLogin,
    validatePasswordChange,
    validateProfileUpdate,
    validateKYC,
    validateAccountDeletion,
}
  
  
  