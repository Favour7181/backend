const request = require('supertest');
const app = require('../app');
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock user data for testing
const mockUser = {
  id: 1,
  firstname: 'Test',
  lastname: 'User',
  email: 'testuser@example.com',
  password: bcrypt.hashSync('password123', 10), // Hashed password
};

beforeAll(async () => {
  await pool.query(
    `INSERT INTO users (id, firstname, lastname, email, password) VALUES ($1, $2, $3, $4, $5)`,
    [mockUser.id, mockUser.firstname, mockUser.lastname, mockUser.email, mockUser.password]
  );
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [mockUser.email]);
  await pool.end();
});

// Test for Login
describe('POST /auth/login', () => {
  it('should log in successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: mockUser.email, password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should return 400 with invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: mockUser.email, password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid email or password');
  });
});

// Test for Registration
describe('POST /auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstname: 'New',
        lastname: 'User',
        email: 'newuser@example.com',
        password: 'newpassword123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered');
  });

  it('should return 400 if user email already exists', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstname: 'Test',
        lastname: 'User',
        email: mockUser.email,
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Email already exists');
  });
});

// Test for Changing Password
describe('POST /auth/change-password', () => {
  it('should change the password successfully', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: 'password123',
        newPassword: 'newPassword456',
        confirmPassword: 'newPassword456',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Password updated successfully');
  });

  it('should return 400 if old password is incorrect', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: 'wrongOldPassword',
        newPassword: 'newPassword456',
        confirmPassword: 'newPassword456',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Old password is incorrect');
  });
});

// Test for Updating Profile
describe('PUT /auth/update-profile', () => {
  it('should update profile successfully', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .put('/auth/update-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Updated',
        lastname: 'User',
        phone: '1234567890',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Profile updated successfully');
  });
});

// Test for Deleting Account
describe('DELETE /auth/delete-account', () => {
  it('should delete account successfully with correct password', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .delete('/auth/delete-account')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Account deleted successfully');
  });

  it('should return 400 with incorrect password', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .delete('/auth/delete-account')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'wrongPassword' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Incorrect password');
  });
});

// Test for KYC
describe('POST /auth/kyc', () => {
  it('should submit KYC successfully', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/auth/kyc')
      .set('Authorization', `Bearer ${token}`)
      .field('bvn', '12345678901')
      .attach('selfie', Buffer.from('dummy data'), 'selfie.png');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'KYC submitted successfully');
  });
});
