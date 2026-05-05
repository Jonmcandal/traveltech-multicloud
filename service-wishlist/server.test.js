const os = require('os');
const path = require('path');
const fs = require('fs');

const TEST_DATA = path.join(os.tmpdir(), `wishlist-test-${process.pid}.json`);
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
    expect(res.body).toEqual({ status: 'ok', service: 'wishlist' });
  });
});

describe('GET /wishlist', () => {
  test('retorna array buit inicialment', async () => {
    const res = await request(app).get('/wishlist');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /wishlist', () => {
  test('afegeix un país a la wishlist', async () => {
    const res = await request(app)
      .post('/wishlist')
      .send({ code: 'JPN', name: 'Japan', flag: '🇯🇵', reason: 'Cultura fascinant' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ code: 'JPN', name: 'Japan', reason: 'Cultura fascinant' });
    expect(res.body.id).toBeDefined();
  });

  test('afegeix sense reason (opcional)', async () => {
    const res = await request(app).post('/wishlist').send({ code: 'ITA', name: 'Italy' });
    expect(res.status).toBe(201);
    expect(res.body.reason).toBe('');
  });

  test('retorna 400 si falta code', async () => {
    const res = await request(app).post('/wishlist').send({ name: 'Japan' });
    expect(res.status).toBe(400);
  });

  test('retorna 400 si falta name', async () => {
    const res = await request(app).post('/wishlist').send({ code: 'JPN' });
    expect(res.status).toBe(400);
  });

  test('retorna 409 si el país ja és a la wishlist', async () => {
    await request(app).post('/wishlist').send({ code: 'JPN', name: 'Japan' });
    const res = await request(app).post('/wishlist').send({ code: 'JPN', name: 'Japan' });
    expect(res.status).toBe(409);
  });
});

describe('PATCH /wishlist/:code', () => {
  test('actualitza el motiu correctament', async () => {
    await request(app).post('/wishlist').send({ code: 'GRC', name: 'Greece' });
    const res = await request(app).patch('/wishlist/GRC').send({ reason: 'Illes meravelloses' });
    expect(res.status).toBe(200);
    expect(res.body.reason).toBe('Illes meravelloses');
  });

  test('retorna 404 si el país no existeix', async () => {
    const res = await request(app).patch('/wishlist/XXX').send({ reason: 'test' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /wishlist/:code', () => {
  test('elimina un element de la wishlist', async () => {
    await request(app).post('/wishlist').send({ code: 'DEU', name: 'Germany' });
    const res = await request(app).delete('/wishlist/DEU');
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('retorna 404 si no existeix', async () => {
    const res = await request(app).delete('/wishlist/XXX');
    expect(res.status).toBe(404);
  });
});
