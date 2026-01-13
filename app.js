const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secreto-super-seguro',
  resave: false,
  saveUninitialized: false
}));

// Rutas
app.use('/api/auth', require('./routes/auth'));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Dashboard protegido
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.sendFile(__dirname + '/public/dashboard.html');
  });
  
  app.get('/api/session', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'No autenticado' });
    res.json(req.session.user);
  });

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
