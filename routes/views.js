const express = require('express');
const router = express.Router();
const path = require('path');

// ─── Rutas públicas ────────────────────────────────
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Rutas protegidas (verificación en cliente) ────
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

router.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

router.get('/perro', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/perro.html'));
});

module.exports = router;
