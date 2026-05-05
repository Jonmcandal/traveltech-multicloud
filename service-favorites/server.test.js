const os = require('os');
const path = require('path');
const fs = require('fs');

const TEST_DATA = path.join(os.tmpdir(), `favorites-test-${process.pid}.json`);
process.env.DATA_FILE = TEST_DATA;

const request = require('supertest');
const app = require('./server');

beforeEach(() => {
  fs.writeFileSync(TEST_DATA, JSON.stringify([]));
});

afterAll(() => {
  if (fs.existsSync(TEST_DATA)) fs.unlinkSync(TEST_DATA);
});

describe('GET /version', () => {
  test('retorna la versió del servei', async () => {
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ version: '1.0.0', service: 'favorites' });
  });
});

describe('GET /health', () => {
  test('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'favorites' });
  });
});

describe('GET /favorites', () => {
  test('retorna array buit inicialment', async () => {
    const res = await request(app).get('/favorites');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /favorites', () => {
  test('afegeix un favorit correctament', async () => {
    const res = await request(app)
      .post('/favorites')
      .send({ code: 'ESP', name: 'Spain', flag: '🇪🇸' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ code: 'ESP', name: 'Spain', flag: '🇪🇸' });
    expect(res.body.id).toBeDefined();
    expect(res.body.addedAt).toBeDefined();
  });

  test('retorna 400 si falta code', async () => {
    const res = await request(app).post('/favorites').send({ name: 'Spain' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('retorna 400 si falta name', async () => {
    const res = await request(app).post('/favorites').send({ code: 'ESP' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('retorna 409 si el país ja és favorit', async () => {
    await request(app).post('/favorites').send({ code: 'ESP', name: 'Spain' });
    const res = await request(app).post('/favorites').send({ code: 'ESP', name: 'Spain' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });
});

describe('DELETE /favorites/:code', () => {
  test('elimina un favorit existent', async () => {
    await request(app).post('/favorites').send({ code: 'FRA', name: 'France' });
    const res = await request(app).delete('/favorites/FRA');
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('retorna 404 si el favorit no existeix', async () => {
    const res = await request(app).delete('/favorites/XXX');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
