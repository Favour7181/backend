// // // connectDB.js
// const { Client } = require('pg');
// const dotenv = require('dotenv');

// dotenv.config();

// const connectDB = async () => {
//   const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   });

//   try {
//     await client.connect();
//     console.log('PostgreSQL connected successfully');
//   } catch (error) {
//     console.error('PostgreSQL connection error:', error);
//     process.exit(1);
//   }

//   return client;
// };

// module.exports = connectDB;


const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for secure connections to Neon
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
