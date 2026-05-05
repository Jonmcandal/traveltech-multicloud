const os = require('os');
const path = require('path');
const fs = require('fs');

const TEST_DATA = path.join(os.tmpdir(), `history-test-${process.pid}.json`);
process.env.DATA_FILE = TEST_DATA;

const request = require('supertest');
const app = require('./server');

beforeEach(() => {
  fs.writeFileSync(TEST_DATA, JSON.stringify([]));
});

afterAll(() => {
  if (fs.existsSync(TEST_DATA)) fs.unlinkSync(TEST_DATA);
});

describe('GET /health', () => {
  test('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'history' });
  });
});

describe('GET /history', () => {
  test('retorna array buit inicialment', async () => {
    const res = await request(app).get('/history');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /history', () => {
  test('afegeix una entrada a l\'historial', async () => {
    const res = await request(app)
      .post('/history')
      .send({ query: 'spain', code: 'ESP', name: 'Spain', flag: '🇪🇸' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ query: 'spain', code: 'ESP' });
    expect(res.body.id).toBeDefined();
    expect(res.body.searchedAt).toBeDefined();
  });

  test('retorna 400 si falta query', async () => {
    const res = await request(app).post('/history').send({ code: 'ESP' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('desduplicació: mou la cerca existent al principi', async () => {
    await request(app).post('/history').send({ query: 'france' });
    await request(app).post('/history').send({ query: 'germany' });
    await request(app).post('/history').send({ query: 'france' });
    const res = await request(app).get('/history');
    expect(res.body[0].query).toBe('france');
    expect(res.body.filter(h => h.query === 'france').length).toBe(1);
  });

  test('desduplicació és insensible a majúscules', async () => {
    await request(app).post('/history').send({ query: 'Spain' });
    await request(app).post('/history').send({ query: 'spain' });
    const res = await request(app).get('/history');
    expect(res.body.length).toBe(1);
  });
});

describe('DELETE /history', () => {
  test('buida tot l\'historial', async () => {
    await request(app).post('/history').send({ query: 'france' });
    await request(app).post('/history').send({ query: 'italy' });
    const res = await request(app).delete('/history');
    expect(res.status).toBe(200);
    const check = await request(app).get('/history');
    expect(check.body).toEqual([]);
  });
});

describe('DELETE /history/:id', () => {
  test('elimina una entrada per id', async () => {
    const post = await request(app).post('/history').send({ query: 'portugal' });
    const id = post.body.id;
    const res = await request(app).delete(`/history/${id}`);
    expect(res.status).toBe(200);
    const check = await request(app).get('/history');
    expect(check.body.find(h => h.id === id)).toBeUndefined();
  });

  test('retorna 404 si l\'entrada no existeix', async () => {
    const res = await request(app).delete('/history/9999999');
    expect(res.status).toBe(404);
  });
});
