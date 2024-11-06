const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
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
describe('POST /api/users/login', () => {
  it('should log in successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: mockUser.email, password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should return 400 with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: mockUser.email, password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid email or password');
  });
});

// Test for Registration
describe('POST /api/users/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/users/register')
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
      .post('/api/users/register')
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
describe('POST /api/users/change-password', () => {
  it('should change the password successfully', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/api/users/change-password')
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
      .post('/api/users/change-password')
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
describe('PUT /api/users/update-profile', () => {
  it('should update profile successfully', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .put('/api/users/update-profile')
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
describe('DELETE /api/users/delete-account', () => {
  it('should delete account successfully with correct password', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .delete('/api/users/delete-account')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Account deleted successfully');
  });

  it('should return 400 with incorrect password', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

    const response = await request(app)
      .delete('/api/users/delete-account')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'wrongPassword' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Incorrect password');
  });
});

// Test for KYC
// describe('POST /auth/kyc', () => {
//   it('should submit KYC successfully', async () => {
//     const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);

//     const response = await request(app)
//       .post('/auth/kyc')
//       .set('Authorization', `Bearer ${token}`)
//       .field('bvn', '12345678901')
//       .attach('selfie', Buffer.from('dummy data'), 'selfie.png');

//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('message', 'KYC submitted successfully');
//   });
// });
