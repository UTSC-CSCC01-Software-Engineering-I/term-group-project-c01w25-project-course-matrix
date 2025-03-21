import request from "supertest";
import { describe, expect, it, test } from "@jest/globals";
import app from "../src/index";

describe("Authentication API", () => {
  // The unit tests below are currently commented out because they require a database connection.
  // They will be uncommented out once all the necessary mocks are in place.
  // describe('POST /auth/login', () => {
  //     it('should return 200 and a token for valid credentials', async () => {
  //         const response = await request(app)
  //             .post('/auth/login')
  //             .send({ username: 'validUser', password: 'validPassword' });
  //         expect(response.status).toBe(200);
  //         expect(response.body).toHaveProperty('token');
  //     });
  //     it('should return 401 for invalid credentials', async () => {
  //         const response = await request(app)
  //             .post('/auth/login')
  //             .send({ username: 'invalidUser', password: 'wrongPassword' });
  //         expect(response.status).toBe(401);
  //         expect(response.body).toHaveProperty('error', 'Invalid credentials');
  //     });
  //     it('should return 400 if username or password is missing', async () => {
  //         const response = await request(app)
  //             .post('/auth/login')
  //             .send({ username: 'validUser' });
  //         expect(response.status).toBe(400);
  //         expect(response.body).toHaveProperty('error', 'Username and password are required');
  //     });
  // });
  // describe('POST /auth/register', () => {
  //     it('should return 201 and create a new user for valid input', async () => {
  //         const response = await request(app)
  //             .post('/auth/register')
  //             .send({ username: 'newUser', password: 'newPassword' });
  //         expect(response.status).toBe(201);
  //         expect(response.body).toHaveProperty('message', 'User registered successfully');
  //     });
  //     it('should return 400 if username is already taken', async () => {
  //         await request(app)
  //             .post('/auth/register')
  //             .send({ username: 'existingUser', password: 'password123' });
  //         const response = await request(app)
  //             .post('/auth/register')
  //             .send({ username: 'existingUser', password: 'password123' });
  //         expect(response.status).toBe(400);
  //         expect(response.body).toHaveProperty('error', 'Username is already taken');
  //     });
  //     it('should return 400 if username or password is missing', async () => {
  //         const response = await request(app)
  //             .post('/auth/register')
  //             .send({ username: '' });
  //         expect(response.status).toBe(400);
  //         expect(response.body).toHaveProperty('error', 'Username and password are required');
  //     });
  // });
  // describe('GET /auth/profile', () => {
  //     it('should return 200 and user profile for valid token', async () => {
  //         const loginResponse = await request(app)
  //             .post('/auth/login')
  //             .send({ username: 'validUser', password: 'validPassword' });
  //         const token = loginResponse.body.token;
  //         const response = await request(app)
  //             .get('/auth/profile')
  //             .set('Authorization', `Bearer ${token}`);
  //         expect(response.status).toBe(200);
  //         expect(response.body).toHaveProperty('username', 'validUser');
  //     });
  //     it('should return 401 if token is missing or invalid', async () => {
  //         const response = await request(app)
  //             .get('/auth/profile')
  //             .set('Authorization', 'Bearer invalidToken');
  //         expect(response.status).toBe(401);
  //         expect(response.body).toHaveProperty('error', 'Unauthorized');
  //     });
  // });
});
