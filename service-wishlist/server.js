const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const DATA_FILE = path.join(__dirname, 'data.json');

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

// GET all wishlist items
app.get('/wishlist', (req, res) => {
  const wishlist = readData();
  res.json(wishlist);
});

// POST add country to wishlist
app.post('/wishlist', (req, res) => {
  const { code, name, flag, reason } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'code and name are required' });
  }
  const wishlist = readData();
  if (wishlist.find(w => w.code === code)) {
    return res.status(409).json({ error: 'Already in wishlist' });
  }
  const newItem = {
    id: Date.now(),
    code,
    name,
    flag: flag || '',
    reason: reason || '',
    addedAt: new Date().toISOString()
  };
  wishlist.push(newItem);
  writeData(wishlist);
  res.status(201).json(newItem);
});

// PATCH update reason
app.patch('/wishlist/:code', (req, res) => {
  const { code } = req.params;
  const { reason } = req.body;
  const wishlist = readData();
  const item = wishlist.find(w => w.code === code);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  item.reason = reason || item.reason;
  writeData(wishlist);
  res.json(item);
});

// DELETE remove from wishlist
app.delete('/wishlist/:code', (req, res) => {
  const { code } = req.params;
  let wishlist = readData();
  const index = wishlist.findIndex(w => w.code === code);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  wishlist.splice(index, 1);
  writeData(wishlist);
  res.json({ message: 'Removed from wishlist' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'wishlist' });
});

app.listen(PORT, () => {
  console.log(`Wishlist service running on port ${PORT}`);
});
