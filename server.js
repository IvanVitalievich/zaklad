const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./db.sqlite');
const SECRET = 'your_joke_secret_123';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Инициализация БД
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
});

// Маршруты API
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'ай-яй-яй! недопустимые данные! Нельзя же так!' });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPass],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Упс! такая кликуха занята' });
        }
        res.json({ 
          message: 'Успешная регистрация, теперь ты один(на) из нас!!',
          id: this.lastID 
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Наша вина, извинити' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ error: 'инвалидные данные))' });
        }
        const token = jwt.sign({ id: user.id }, SECRET);
        res.json({ 
          message: 'Ну наконец то! вспомнил(а) про нас!',
          token,
          username: user.username
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'наша вина, простити' });
  }
});

// Защищенные маршруты
app.use('/api/protected', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'незареган' });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Токен инвалид' });
  }
});

app.delete('/api/protected/me', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Аккаунт удален(но мы тебя запомнили)' });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});