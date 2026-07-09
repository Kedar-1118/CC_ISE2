const request = require('supertest');
const app = require('../app');
const db = require('./db');
const User = require('../models/User');
const Project = require('../models/Project');

let user;
let project;
const apiKey = 'test-api-key-1234';

beforeAll(async () => {
    process.env.WEEKLY_RATE_LIMIT = '5';
    await db.connect();
});

afterAll(async () => {
    await db.close();
});

beforeEach(async () => {
    await db.clear();

    user = await User.create({ email: 'owner@example.com' });
    
    project = await Project.create({
        projectName: 'Test Mock API',
        owner: user._id,
        apiKey: apiKey,
        collections: new Map([
            [
                'products',
                [
                    { _id: 'prod-1', name: 'Keyboard', price: 99.99 },
                    { _id: 'prod-2', name: 'Mouse', price: 49.99 },
                ],
            ],
        ]),
        weeklyRateLimit: {
            requestCount: 0,
            weekStart: new Date(),
            limit: 5,
        },
    });
});

describe('Mock API Engine', () => {
    describe('Authentication & Basic Routing', () => {
        it('should fail with 401 if API key is invalid', async () => {
            const res = await request(app).get('/api/invalid-key/products');
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid API key');
        });

        it('should return 404 if collection does not exist', async () => {
            const res = await request(app).get(`/api/${apiKey}/non-existent`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('not found');
        });
    });

    describe('GET Operations', () => {
        it('should list all records in a collection', async () => {
            const res = await request(app).get(`/api/${apiKey}/products`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            expect(res.body[0]._id).toBe('prod-1');
            expect(res.body[0].name).toBe('Keyboard');
        });

        it('should get a single record by ID', async () => {
            const res = await request(app).get(`/api/${apiKey}/products/prod-2`);
            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe('prod-2');
            expect(res.body.name).toBe('Mouse');
        });

        it('should return 404 if record ID is not found', async () => {
            const res = await request(app).get(`/api/${apiKey}/products/non-existent-id`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST Operations', () => {
        it('should add a new record to the collection and save to DB', async () => {
            const res = await request(app)
                .post(`/api/${apiKey}/products`)
                .send({ name: 'Monitor', price: 299.99 });

            expect(res.statusCode).toBe(201);
            expect(res.body._id).toBeDefined();
            expect(res.body.name).toBe('Monitor');

            const updatedProject = await Project.findById(project._id);
            const products = updatedProject.collections.get('products');
            expect(products).toHaveLength(3);
            expect(products.find(p => p.name === 'Monitor')).toBeDefined();
        });

        it('should fail if body is not a JSON object', async () => {
            // Case 1: Invalid JSON syntax (body parser throws error)
            const resInvalidJson = await request(app)
                .post(`/api/${apiKey}/products`)
                .set('Content-Type', 'application/json')
                .send('not-a-json-object');

            expect(resInvalidJson.statusCode).toBe(400);

            // Case 2: Valid JSON but not an object (e.g. array) (controller returns 400)
            const resArray = await request(app)
                .post(`/api/${apiKey}/products`)
                .send([{ name: 'Monitor' }]);

            expect(resArray.statusCode).toBe(400);
            expect(resArray.body.success).toBe(false);
            expect(resArray.body.error).toBe('Request body must be a JSON object');
        });
    });

    describe('PUT Operations', () => {
        it('should update an existing record by ID and save to DB', async () => {
            const res = await request(app)
                .put(`/api/${apiKey}/products/prod-1`)
                .send({ price: 89.99, stock: 10 });

            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe('prod-1');
            expect(res.body.name).toBe('Keyboard');
            expect(res.body.price).toBe(89.99);
            expect(res.body.stock).toBe(10);

            const updatedProject = await Project.findById(project._id);
            const record = updatedProject.collections.get('products').find(p => p._id === 'prod-1');
            expect(record.price).toBe(89.99);
            expect(record.stock).toBe(10);
        });

        it('should return 404 for updating a non-existent record ID', async () => {
            const res = await request(app)
                .put(`/api/${apiKey}/products/non-existent-id`)
                .send({ price: 10 });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE Operations', () => {
        it('should delete a record by ID and save to DB', async () => {
            const res = await request(app).delete(`/api/${apiKey}/products/prod-1`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const updatedProject = await Project.findById(project._id);
            const products = updatedProject.collections.get('products');
            expect(products).toHaveLength(1);
            expect(products.find(p => p._id === 'prod-1')).toBeUndefined();
        });

        it('should return 404 for deleting a non-existent record ID', async () => {
            const res = await request(app).delete(`/api/${apiKey}/products/non-existent-id`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('Weekly Rate Limiting', () => {
        it('should block requests and return 429 when rate limit is exceeded', async () => {
            for (let i = 0; i < 5; i++) {
                const res = await request(app).get(`/api/${apiKey}/products`);
                expect(res.statusCode).toBe(200);
            }

            const resExceeded = await request(app).get(`/api/${apiKey}/products`);
            expect(resExceeded.statusCode).toBe(429);
            expect(resExceeded.body.success).toBe(false);
            expect(resExceeded.body.error).toBe('Weekly rate limit exceeded');
            expect(resExceeded.body.rateLimit.used).toBe(5);
        });
    });
});
