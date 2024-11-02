
const pool = require('../config/db');

const getUser = async (req, res) => {
  try {
    const { id } = req.user;

    const result = await pool.query('SELECT id, firstname, lastname, email, is_verified FROM users WHERE id = $1', [id]);
    
    const user = result.rows[0]

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    res.status(200).json({success: true, user});
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getUser,
};
