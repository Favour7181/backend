const request = require('supertest');
const app = require('../index'); // Adjust path as needed
const pool = require('../config/db'); // Adjust path as needed

describe('User Registration', () => {
  beforeAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = 'testuser@example.com'`); // Clean up any test data
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM users WHERE email = 'testuser@example.com'`); // Clean up any test data
    await pool.end(); // Close the database connection
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/users/register').send({
      firstname: 'Test',
      lastname: 'User',
      email: 'testuser@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'User registered. Please check your email to verify your account.');
  });

  it('should return an error for existing email', async () => {
    const res = await request(app).post('/register').send({
      firstname: 'Test',
      lastname: 'User',
      email: 'testuser@example.com', // Duplicate email
      password: 'password123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email already exists');
  });
});
