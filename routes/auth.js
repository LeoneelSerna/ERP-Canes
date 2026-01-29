const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../models/database');  // Tu mysql2 pool con ics_k9
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [email, hashedPassword, email]  // email como username
    );

    res.status(201).json({ 
      message: 'Usuario registrado correctamente', 
      id: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    console.error('Register error:', error);  // Debug log
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, email]
    );
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    req.session.user = { 
      id: user.id, 
      username: user.username || user.email,
      email: user.email 
    };

    res.json({ 
      message: 'Login exitoso', 
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);  // Debug
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.json({ message: 'Sesión cerrada' });
  });
});

// GET /api/auth/users (DEBUG - sin passwords)
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ count: rows.length, users: rows });
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
