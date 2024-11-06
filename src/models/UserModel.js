const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Create User Function
async function createUser(firstname, lastname, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour


  const result = await pool.query(
    `INSERT INTO users (firstname, lastname, email, password, verification_token, verification_token_expires)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [firstname, lastname, email, hashedPassword, verificationToken, verificationTokenExpires]
  );
  return verificationToken
}

// Find User by Email
async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, email, name FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}


const findUserById = async (userId) => {
  try {
    // Query the database for the user by ID
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    // If no user is found, return null
    if (result.rows.length === 0) {
      return null;
    }

    // Return the user object (first row in the result)
    return result.rows[0];
  } catch (error) {
    console.error('Error in findUserById:', error);
    throw new Error('Database query error');
  }
};




module.exports = { createUser, findUserByEmail, findUserById };
