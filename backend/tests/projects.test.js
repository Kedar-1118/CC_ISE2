const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('./db');
const User = require('../models/User');
const Project = require('../models/Project');

let user;
let otherUser;
let token;
let otherToken;

beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret123456789012345678901234567890';
    await db.connect();
});

afterAll(async () => {
    await db.close();
});

beforeEach(async () => {
    await db.clear();

    // Create test users
    user = await User.create({ email: 'owner@example.com' });
    otherUser = await User.create({ email: 'other@example.com' });

    // Generate tokens
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    otherToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

describe('Projects API', () => {
    describe('POST /api/projects', () => {
        it('should create a project with valid data', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    projectName: 'Test Project',
                    jsonData: {
                        users: [{ name: 'Alice' }, { name: 'Bob' }],
                    },
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.projectName).toBe('Test Project');
            expect(res.body.data.apiKey).toBeDefined();
            expect(res.body.data.collections.users).toHaveLength(2);
            expect(res.body.data.collections.users[0]._id).toBeDefined();

            const project = await Project.findById(res.body.data.id);
            expect(project).toBeDefined();
            expect(project.owner.toString()).toBe(user._id.toString());
        });

        it('should fail if user already has 3 projects', async () => {
            await Project.create({ projectName: 'P1', owner: user._id, apiKey: 'k1', collections: new Map() });
            await Project.create({ projectName: 'P2', owner: user._id, apiKey: 'k2', collections: new Map() });
            await Project.create({ projectName: 'P3', owner: user._id, apiKey: 'k3', collections: new Map() });

            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    projectName: 'P4',
                    jsonData: {},
                });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('maximum of 3 projects');
        });

        it('should fail if project name already exists', async () => {
            await Project.create({ projectName: 'DuplicateName', owner: user._id, apiKey: 'k1', collections: new Map() });

            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    projectName: 'DuplicateName',
                    jsonData: {},
                });

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('already exists');
        });

        it('should fail with missing name or invalid JSON data', async () => {
            const resNoName = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    jsonData: {},
                });
            expect(resNoName.statusCode).toBe(400);

            const resInvalidJson = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    projectName: 'Test',
                    jsonData: 'not-an-object',
                });
            expect(resInvalidJson.statusCode).toBe(400);
        });
    });

    describe('GET /api/projects', () => {
        it('should return all projects of the logged in user', async () => {
            await Project.create({ projectName: 'P1', owner: user._id, apiKey: 'k1', collections: new Map() });
            await Project.create({ projectName: 'Other Project', owner: otherUser._id, apiKey: 'k2', collections: new Map() });

            const res = await request(app)
                .get('/api/projects')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(1);
            expect(res.body.data[0].projectName).toBe('P1');
        });
    });

    describe('GET /api/projects/:id', () => {
        let project;

        beforeEach(async () => {
            project = await Project.create({
                projectName: 'P1',
                owner: user._id,
                apiKey: 'key-123',
                collections: new Map([['items', [{ _id: '1', name: 'Item 1' }]]]),
            });
        });

        it('should fetch project details for the owner', async () => {
            const res = await request(app)
                .get(`/api/projects/${project._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.projectName).toBe('P1');
            expect(res.body.data.collections.items).toBeDefined();
        });

        it('should fail for non-owner', async () => {
            const res = await request(app)
                .get(`/api/projects/${project._id}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Not authorized');
        });

        it('should return 404 if project does not exist', async () => {
            const nonExistentId = new User()._id;
            const res = await request(app)
                .get(`/api/projects/${nonExistentId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/projects/:id/reset-key', () => {
        let project;

        beforeEach(async () => {
            project = await Project.create({
                projectName: 'P1',
                owner: user._id,
                apiKey: 'original-key',
                collections: new Map(),
            });
        });

        it('should reset API key successfully', async () => {
            const res = await request(app)
                .post(`/api/projects/${project._id}/reset-key`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.apiKey).toBeDefined();
            expect(res.body.data.apiKey).not.toBe('original-key');

            const updatedProject = await Project.findById(project._id);
            expect(updatedProject.apiKey).toBe(res.body.data.apiKey);
        });

        it('should fail to reset key for non-owner', async () => {
            const res = await request(app)
                .post(`/api/projects/${project._id}/reset-key`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('DELETE /api/projects/:id', () => {
        let project;

        beforeEach(async () => {
            project = await Project.create({
                projectName: 'P1',
                owner: user._id,
                apiKey: 'key-to-delete',
                collections: new Map(),
            });
        });

        it('should delete project for owner', async () => {
            const res = await request(app)
                .delete(`/api/projects/${project._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const check = await Project.findById(project._id);
            expect(check).toBeNull();
        });

        it('should fail to delete project for non-owner', async () => {
            const res = await request(app)
                .delete(`/api/projects/${project._id}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.statusCode).toBe(403);
            
            const check = await Project.findById(project._id);
            expect(check).toBeDefined();
        });
    });
});
