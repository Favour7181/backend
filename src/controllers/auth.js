
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { createUser, findUserByEmail } = require('../models/UserModel');
require('dotenv').config();
const sendVerificationEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const { validationResult, check, param } = require('express-validator');

 
const validateRegister = [
  check('firstname').trim().notEmpty().isLength({min:3}).withMessage('first Name is required').escape(),
  check('lastname').trim().notEmpty().isLength({min:3}).withMessage('Last Name is required').escape(),
  check('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 6 characters long')
    .trim().escape(),
];

const validateLogin = [
  check('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  check('password')
    .notEmpty().withMessage('Password is required')
    .trim().escape(),
];

const validateVerifyEmail = [
  param('token')
    .trim()
    .isLength({ min: 32, max: 64 }).withMessage('Invalid or malformed token')
    .escape(),
];
    
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { firstname, lastname, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await findUserByEmail(email)
    if (userExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // const verificationToken = createUser(firstname, lastname, email, password)

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Save the new user to the database
    const newUser = await pool.query(
      `INSERT INTO users (firstname, lastname, email, password, verification_token, verification_token_expires)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [firstname, lastname, email, hashedPassword, verificationToken, verificationTokenExpires]
    );


    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ success:true, message: 'User registered. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


//updating verified user
const verifyEmail = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


  const { token } = req.params;

  try {
    const user = await pool.query(
      `SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()`,
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Mark user as verified
    await pool.query(
      `UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1`,
      [user.rows[0].id]
    );

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


const login = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email)

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn:process.env.JWT_EXPIRES_IN });
    res.json({ success:true, message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};



// const verifyEmail = async (req, res) => {
//   const { token } = req.params;

//   try {
//     const user = await pool.query(
//       `SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()`,
//       [token]
//     );

//     if (user.rows.length === 0) {
//       return res.redirect(`${process.env.FRONTEND_URL}/verify?status=failed&message=Invalid or expired token`);
//     }

//     // Mark user as verified
//     await pool.query(
//       `UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1`,
//       [user.rows[0].id]
//     );

//     // Redirect to the frontend with a success message
//     res.redirect(`${process.env.FRONTEND_URL}/verify?status=success&message=Email verified successfully`);
//   } catch (error) {
//     console.error('Error verifying email:', error);
//     res.redirect(`${process.env.FRONTEND_URL}/verify?status=failed&message=Server error`);
//   }
// };


  
  
module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  register,
  verifyEmail, 
  login,
}






