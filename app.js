const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ─── Middleware global ─────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto-k9',
  resave: false,
  saveUninitialized: false
}));

// ─── Rutas públicas (auth) ─────────────────────────
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ─── Rutas API protegidas con JWT ──────────────────
const verificarToken = require('./middleware/authJWT');
const perrosRoutes = require('./routes/api/perros');
app.use('/api/perros', verificarToken, perrosRoutes);

// ─── Rutas HTML ────────────────────────────────────
const viewRoutes = require('./routes/views');
app.use('/', viewRoutes);

// ─── Iniciar servidor ──────────────────────────────
app.listen(port, () => {
  console.log(`✅ Servidor en http://localhost:${port}`);
});
