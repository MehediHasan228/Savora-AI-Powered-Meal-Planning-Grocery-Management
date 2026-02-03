const request = require('supertest');
const express = require('express');
const app = express();

// Basic health check simulation
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is running' });
});

describe('API Health Check', () => {
    it('should return 200 OK for health endpoint', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('OK');
    });
});
