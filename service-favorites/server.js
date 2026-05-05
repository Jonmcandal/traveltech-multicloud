const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all favorites
app.get('/favorites', (req, res) => {
  const favorites = readData();
  res.json(favorites);
});

// POST add favorite
app.post('/favorites', (req, res) => {
  const { code, name, flag } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'code and name are required' });
  }
  const favorites = readData();
  if (favorites.find(f => f.code === code)) {
    return res.status(409).json({ error: 'Already in favorites' });
  }
  const newFav = { id: Date.now(), code, name, flag: flag || '', addedAt: new Date().toISOString() };
  favorites.push(newFav);
  writeData(favorites);
  res.status(201).json(newFav);
});

// DELETE remove favorite by code
app.delete('/favorites/:code', (req, res) => {
  const { code } = req.params;
  let favorites = readData();
  const index = favorites.findIndex(f => f.code === code);
  if (index === -1) {
    return res.status(404).json({ error: 'Favorite not found' });
  }
  favorites.splice(index, 1);
  writeData(favorites);
  res.json({ message: 'Removed from favorites' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'favorites' });
});

// Version info
app.get('/version', (req, res) => {
  res.json({ version: '1.0.0', service: 'favorites' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Favorites service running on port ${PORT}`);
  });
}

module.exports = app;
