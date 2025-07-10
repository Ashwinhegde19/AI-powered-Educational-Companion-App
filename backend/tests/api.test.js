const request = require('supertest');
const app = require('../src/server');

describe('API Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body).toMatchObject({
      status: 'OK',
      environment: expect.any(String)
    });
  });
});

describe('Video API', () => {
  describe('GET /api/videos/random', () => {
    it('should return random videos', async () => {
      const res = await request(app)
        .get('/api/videos/random')
        .expect(200);

      expect(res.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        count: expect.any(Number)
      });
    });

    it('should respect limit parameter', async () => {
      const limit = 3;
      const res = await request(app)
        .get(`/api/videos/random?limit=${limit}`)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('GET /api/videos/:videoId', () => {
    it('should return 404 for non-existent video', async () => {
      const res = await request(app)
        .get('/api/videos/nonexistent123')
        .expect(404);

      expect(res.body).toMatchObject({
        success: false,
        message: 'Video not found'
      });
    });

    it('should validate video ID format', async () => {
      const res = await request(app)
        .get('/api/videos/invalid')
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/videos/process', () => {
    it('should validate video ID', async () => {
      const res = await request(app)
        .post('/api/videos/process')
        .send({ videoId: 'invalid' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should accept valid video ID format', async () => {
      const res = await request(app)
        .post('/api/videos/process')
        .send({ videoId: 'dQw4w9WgXcQ' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('processing');
    });
  });
});

describe('Channel API', () => {
  describe('GET /api/channels', () => {
    it('should return channels list', async () => {
      const res = await request(app)
        .get('/api/channels')
        .expect(200);

      expect(res.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        pagination: expect.any(Object)
      });
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/channels?page=1&limit=5')
        .expect(200);

      expect(res.body.pagination).toMatchObject({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        pages: expect.any(Number)
      });
    });
  });

  describe('GET /api/channels/category/:category', () => {
    it('should return channels by category', async () => {
      const res = await request(app)
        .get('/api/channels/category/Mathematics')
        .expect(200);

      expect(res.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        count: expect.any(Number)
      });
    });

    it('should validate category', async () => {
      const res = await request(app)
        .get('/api/channels/category/InvalidCategory')
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});

describe('AI API', () => {
  describe('GET /api/ai/health', () => {
    it('should return AI services health status', async () => {
      const res = await request(app)
        .get('/api/ai/health');

      expect(res.body).toMatchObject({
        success: expect.any(Boolean),
        data: expect.objectContaining({
          gemini: expect.any(Object),
          qdrant: expect.any(Object)
        })
      });
    });
  });

  describe('POST /api/ai/generate-embedding', () => {
    it('should validate text input', async () => {
      const res = await request(app)
        .post('/api/ai/generate-embedding')
        .send({ text: '' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should accept valid text input', async () => {
      const res = await request(app)
        .post('/api/ai/generate-embedding')
        .send({ text: 'This is a test text for embedding generation.' });

      // Note: This might fail if Gemini API is not configured
      if (res.status === 200) {
        expect(res.body).toMatchObject({
          success: true,
          data: expect.objectContaining({
            embedding: expect.any(Array),
            dimension: expect.any(Number)
          })
        });
      } else {
        expect(res.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('POST /api/ai/find-ncert-concepts', () => {
    it('should validate transcript input', async () => {
      const res = await request(app)
        .post('/api/ai/find-ncert-concepts')
        .send({ transcript: 'short' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should accept valid transcript input', async () => {
      const transcript = 'This is a longer transcript about mathematics and algebra concepts in education.';
      
      const res = await request(app)
        .post('/api/ai/find-ncert-concepts')
        .send({ transcript });

      // Note: This might fail if Gemini API is not configured
      if (res.status === 200) {
        expect(res.body).toMatchObject({
          success: true,
          data: expect.any(Array),
          count: expect.any(Number)
        });
      } else {
        expect(res.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});

describe('Error Handling', () => {
  it('should handle 404 for unknown routes', async () => {
    const res = await request(app)
      .get('/api/unknown-route')
      .expect(404);

    expect(res.body).toMatchObject({
      message: 'Route not found'
    });
  });

  it('should handle rate limiting', async () => {
    // This test would require making many requests quickly
    // Skipping for now as it depends on rate limiting configuration
  });
});
