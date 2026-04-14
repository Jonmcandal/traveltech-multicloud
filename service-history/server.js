const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;
const DATA_FILE = process.env.VERCEL ? '/tmp/data.json' : path.join(__dirname, 'data.json');
const MAX_HISTORY = 50;

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

// GET all history
app.get('/history', (req, res) => {
  const history = readData();
  res.json(history);
});

// POST add search to history
app.post('/history', (req, res) => {
  const { query, code, name, flag } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }
  let history = readData();

  // Remove duplicate query if exists (move to top)
  history = history.filter(h => h.query.toLowerCase() !== query.toLowerCase());

  const newEntry = {
    id: Date.now(),
    query,
    code: code || '',
    name: name || '',
    flag: flag || '',
    searchedAt: new Date().toISOString()
  };

  // Add to the beginning
  history.unshift(newEntry);

  // Keep only MAX_HISTORY entries
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }

  writeData(history);
  res.status(201).json(newEntry);
});

// DELETE clear all history
app.delete('/history', (req, res) => {
  writeData([]);
  res.json({ message: 'History cleared' });
});

// DELETE remove one entry by id
app.delete('/history/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let history = readData();
  const index = history.findIndex(h => h.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  history.splice(index, 1);
  writeData(history);
  res.json({ message: 'Entry removed' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'history' });
});

app.listen(PORT, () => {
  console.log(`History service running on port ${PORT}`);
});
