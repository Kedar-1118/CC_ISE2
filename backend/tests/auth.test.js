const request = require('supertest');
const app = require('../app');
const db = require('./db');
const User = require('../models/User');
const Otp = require('../models/Otp');

beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret123456789012345678901234567890';
    process.env.JWT_EXPIRES_IN = '1h';
    await db.connect();
});

afterAll(async () => {
    await db.close();
});

beforeEach(async () => {
    await db.clear();
});

describe('Authentication API', () => {
    describe('POST /api/auth/send-otp', () => {
        it('should send OTP successfully for a valid email', async () => {
            const res = await request(app)
                .post('/api/auth/send-otp')
                .send({ email: 'test@example.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('OTP sent to your email');

            const otpDoc = await Otp.findOne({ email: 'test@example.com' });
            expect(otpDoc).toBeDefined();
            expect(otpDoc.code).toMatch(/^\d{6}$/);
        });

        it('should fail if email is missing', async () => {
            const res = await request(app)
                .post('/api/auth/send-otp')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Email is required');
        });

        it('should fail if email format is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/send-otp')
                .send({ email: 'invalid-email' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Please enter a valid email address');
        });
    });

    describe('POST /api/auth/verify-otp', () => {
        beforeEach(async () => {
            await Otp.create({ email: 'test@example.com', code: '123456' });
        });

        it('should register/login user with correct OTP', async () => {
            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: 'test@example.com', otp: '123456' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.data.email).toBe('test@example.com');

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user).toBeDefined();
            expect(user._id.toString()).toBe(res.body.data.id);

            const otpDoc = await Otp.findOne({ email: 'test@example.com' });
            expect(otpDoc).toBeNull();

            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toMatch(/token=/);
        });

        it('should fail with incorrect OTP', async () => {
            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: 'test@example.com', otp: '999999' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid OTP. Please try again.');
        });

        it('should fail if OTP expired/not found', async () => {
            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: 'other@example.com', otp: '123456' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('expired or was not requested');
        });
    });

    describe('GET /api/auth/me', () => {
        let token;
        let user;

        beforeEach(async () => {
            user = await User.create({ email: 'user@example.com' });
            
            await Otp.create({ email: 'user@example.com', code: '111111' });
            const loginRes = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: 'user@example.com', otp: '111111' });
            token = loginRes.body.token;
        });

        it('should return current user profile with valid Bearer token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('user@example.com');
            expect(res.body.data.id).toBe(user._id.toString());
        });

        it('should return current user profile with valid cookie token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('user@example.com');
        });

        it('should fail without token', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Authentication required');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should clear token cookie on logout', async () => {
            const res = await request(app)
                .post('/api/auth/logout');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toMatch(/token=;/);
        });
    });
});
