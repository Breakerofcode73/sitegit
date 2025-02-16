// index.js
require('dotenv').config(); // Загружаем переменные окружения из .env

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Настройка Socket.io с CORS (при необходимости заменить origin)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());

// Настройки подключения к базе данных из .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

// JWT секрет
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware для проверки JWT токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Ожидается заголовок: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Токен не предоставлен' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Неверный токен' });
    req.user = user;
    next();
  });
}

// Эндпоинт регистрации пользователя
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Имя пользователя и пароль обязательны.' });
  }
  
  try {
    // Проверяем, существует ли уже пользователь с таким именем
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'Такой аккаунт уже существует. Пожалуйста, войдите или зарегистрируйте другой аккаунт.'
      });
    }
    
    // Хэшируем пароль и создаем пользователя
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    const user = result.rows[0];
    
    // Создаем JWT-токен
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт входа пользователя
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Имя пользователя и пароль обязательны.' });
  }
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(400).json({
        message: 'Такого аккаунта не существует. Пожалуйста, зарегистрируйтесь.'
      });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Неверный пароль.' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт для получения сообщений чата (требует авторизации)
app.get('/chat', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT chat_messages.*, users.username 
      FROM chat_messages 
      JOIN users ON chat_messages.user_id = users.id 
      ORDER BY chat_messages.created_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт для отправки сообщения в чат
app.post('/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ message: 'Сообщение не может быть пустым.' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO chat_messages (user_id, message) VALUES ($1, $2) RETURNING *',
      [req.user.id, message]
    );
    const newMessage = result.rows[0];
    
    // Рассылаем сообщение всем подключенным клиентам
    io.emit('newMessage', { 
      id: newMessage.id,
      user_id: req.user.id,
      username: req.user.username,
      message: newMessage.message,
      created_at: newMessage.created_at
    });
    
    res.json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обработка подключений через Socket.io
io.on('connection', (socket) => {
  console.log(`Новое подключение: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Отключение: ${socket.id}`);
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
