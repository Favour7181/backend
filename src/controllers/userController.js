
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById } = require('../models/UserModel');
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
    // console.log("userExists", userExists)
    if (userExists) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name`,
      [email, hashedPassword, name]
    );

    const userData = newUser.rows[0]

    const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({ 
      success: true, 
      message: 'User registered', 
      user: userData,
      token: token
     });
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
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    delete user.password;

    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Error in login controller:', error.message);
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


  const { name, phone_number } = req.body;
  const userId = req.user.id;

  try {
    if (!name && !phone_number) {
      console.log("No fields provided");
      return res.status(400).json({ message: "No fields provided" });
    }

    let query;
    let queryParams;

    if (!name) {
      query = `UPDATE "users" SET "phone_number" = $1 WHERE "id" = $2 RETURNING *`;
      queryParams = [phone_number, userId];
    } else if (!phone_number) {
      query = `UPDATE "users" SET "name" = $1 WHERE "id" = $2 RETURNING *`;
      queryParams = [name, userId];
    } else {
      query = `UPDATE "users" SET "name" = $1, "phone_number" = $2 WHERE "id" = $3 RETURNING *`;
      queryParams = [name, phone_number, userId];
    }

    // console.log("Executing query:", query);
    const updatedUserResult = await pool.query(query, queryParams);
    // console.log("Update result:", updatedUserResult.rows);

    if (updatedUserResult.rows.length === 0) {
      return res.status(400).json({ message: "No changes made or user not found" });
    }

    const user = updatedUserResult.rows[0]
    delete user.password
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    // console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// DELETE /api/user/delete


const deleteAccount = async (req, res) => {


  const { password } = req.body;
  const userId = req.user.id;

  try {
    // console.log('User ID:', userId);  // Log user ID to check if it's set properly
    // console.log('Password from request:', password);  // Log password to check input

    // Retrieve the user from the database
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the provided password matches the user's password
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Delete the user from the database
    const deleteResult = await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    // console.log('Delete result:', deleteResult);  // Log the result of the delete query

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    // console.error('Error deleting account:', error);  // Log the error
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { deleteAccount };



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