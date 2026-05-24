import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'db.json');

// Helper baca file SYNC (lebih reliable)
function readDB() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Gagal baca db.json:', err.message);
    return { suggestions: [], recentSearches: [] };
  }
}

// Helper tulis file SYNC
function writeDB(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ db.json diupdate:', new Date().toLocaleTimeString());
  } catch (err) {
    console.error('Gagal tulis db.json:', err.message);
  }
}

// GET all
app.get('/api/suggestions', (req, res) => {
  const db = readDB();
  res.json(db.suggestions);
});

// GET search
app.get('/api/suggestions/search', (req, res) => {
  const { q, category } = req.query;
  const db = readDB();
  let results = db.suggestions;

  if (q) {
    results = results.filter(s => s.text.toLowerCase().includes(q.toLowerCase()));
  }
  if (category && category !== 'All') {
    results = results.filter(s => s.category === category);
  }
  res.json(results.sort((a, b) => b.count - a.count).slice(0, 15));
});

// POST create
app.post('/api/suggestions', (req, res) => {
  const db = readDB();
  const { text, category, count = 0 } = req.body;

  if (!text || !category) {
    return res.status(400).json({ error: 'Text dan category wajib diisi' });
  }

  const exists = db.suggestions.some(s => s.text.toLowerCase() === text.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Data sudah ada' });
  }

  const newItem = { id: Date.now(), text, category, count: Number(count) };
  db.suggestions.push(newItem);
  writeDB(db);

  res.status(201).json(newItem);
});

// PUT update
app.put('/api/suggestions/:id', (req, res) => {
  const db = readDB();
  const idx = db.suggestions.findIndex(s => s.id == req.params.id);

  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  db.suggestions[idx] = { ...db.suggestions[idx], ...req.body };
  writeDB(db);

  res.json(db.suggestions[idx]);
});

// DELETE
app.delete('/api/suggestions/:id', (req, res) => {
  const db = readDB();
  db.suggestions = db.suggestions.filter(s => s.id != req.params.id);
  writeDB(db);

  res.json({ message: 'Deleted' });
});

// POST track search (naikin count + recent)
app.post('/api/suggestions/track', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  const db = readDB();

  const item = db.suggestions.find(s => s.text.toLowerCase() === text.toLowerCase());
  if (item) {
    item.count += 1;
  }

  db.recentSearches = [text, ...db.recentSearches.filter(r => r !== text)].slice(0, 10);
  writeDB(db);

  res.json({ success: true });
});

// GET recent
app.get('/api/suggestions/recent', (req, res) => {
  const db = readDB();
  res.json(db.recentSearches);
});

// GET stats
app.get('/api/suggestions/stats', (req, res) => {
  const db = readDB();
  const total = db.suggestions.length;
  const totalSearches = db.suggestions.reduce((a, s) => a + s.count, 0);

  res.json({
    total,
    totalSearches,
    avgCount: total > 0 ? Math.round(totalSearches / total) : 0,
    topItems: [...db.suggestions].sort((a, b) => b.count - a.count).slice(0, 5),
    categoryData: Object.entries(
      db.suggestions.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + s.count;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }))
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  console.log(`📁 File data: ${DATA_FILE}`);
});