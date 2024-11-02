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
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

module.exports = { createUser, findUserByEmail };
