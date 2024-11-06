
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('../models/UserModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { validationResult } = require('express-validator');







// POST /api/auth/register
const register = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    const userExists = await findUserByEmail(email);
    if (userExists) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name`,
      [email, hashedPassword, name]
    );

    res.status(201).json({ success: true, message: 'User registered', user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


// POST /api/auth/login
const login = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // if (!user.is_verified) {
    //   return res.status(403).json({ error: 'Email not verified' });
    // }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


// POST /api/auth/change-password
const changePassword = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await findUserById(userId);

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedNewPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


// PUT /api/user/update-profile
const updateProfile = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, number } = req.body;
  const userId = req.user.id;

  try {
    const updatedUser = await pool.query(
      `UPDATE users SET name = $1, number = $2 WHERE id = $3 RETURNING id, email, name, number`,
      [name, number, userId]
    );

    res.json({ message: 'Profile updated successfully', user: updatedUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


// DELETE /api/user/delete
const deleteAccount = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { password } = req.body;
  const userId = req.user.id;

  try {
    const user = await findUserById(userId);

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


// POST /api/user/kyc



const kycVerification = async (req, res) => {

  

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { bvn } = req.body;
  const selfie = req.file; 
  const userId = req.user.id;

  if (!bvn || !selfie) {
    return res.status(400).json({ message: 'BVN and selfie are required.' });
}

  try {
    const selfieURL = selfie.path

    await pool.query(
      `UPDATE users SET bvn = $1, selfie = $2, kyc_verified = TRUE WHERE id = $3`,
      [bvn, selfieURL, userId]
    );

    res.json({ message: 'KYC verification submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// module.exports = {
//   getUser,
// };

module.exports = {
  register,
  login,
  changePassword,
  updateProfile,
  deleteAccount,
  kycVerification,
}