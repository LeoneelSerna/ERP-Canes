const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../models/database');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || 'clave-secreta-k9-2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [email, hashedPassword, email]
    );

    res.status(201).json({ 
      message: 'Usuario registrado correctamente', 
      id: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    console.error('Register error:', error);
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

    // ✅ Generar JWT (dura 7 días)
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username || user.email },
      SECRET,
      { expiresIn: '7d' }
    );

    // Mantener sesión también (compatibilidad)
    req.session.user = { 
      id: user.id, 
      username: user.username || user.email,
      email: user.email 
    };

    res.json({ 
      message: 'Login exitoso',
      token,
      user: { id: user.id, email: user.email, username: user.username || user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
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

// GET /api/auth/verify - Verificar token activo
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: 'Sin token' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Token expirado o inválido' });
  }
});

// GET /api/auth/users (DEBUG)
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
