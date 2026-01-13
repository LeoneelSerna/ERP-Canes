const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Función para leer usuarios del archivo
async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return []; // Archivo no existe = usuarios vacíos
  }
}

// Función para guardar usuarios al archivo
async function saveUsers(users) {
  try {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error guardando usuarios:', error);
  }
}

// DEBUG: Ver todos los usuarios
router.get('/users', async (req, res) => {
  const users = await loadUsers();
  res.json({ count: users.length, users: users.map(u => ({ email: u.email, id: u.id })) });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await loadUsers();
    
    // Verificar si existe
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    // Guardar
    users.push(newUser);
    await saveUsers(users);
    
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await loadUsers();
    
    // Buscar usuario
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
    
    // Guardar en sesión
    req.session.user = { id: user.id, email: user.email };
    
    res.json({ 
      message: 'Login exitoso', 
      user: { email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.json({ message: 'Sesión cerrada' });
  });
});

module.exports = router;
