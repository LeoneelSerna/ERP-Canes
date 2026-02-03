const express = require('express');
const pool = require('../../models/database');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// ========== CONFIGURACIÓN MULTER ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Carpeta donde se guardan
  },
  filename: (req, file, cb) => {
    const uniqueName = `perro-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

// ========== RUTAS EXISTENTES ==========

// GET /api/perros - Listar todos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT *, DATE_FORMAT(fecha_nac, '%d/%m/%Y') as fecha_nac_fmt 
      FROM perros 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/perros/filtros (ANTES de /:microchip)
router.get('/filtros', async (req, res) => {
  try {
    let query = 'SELECT * FROM perros WHERE 1=1';
    const params = [];
    
    if (req.query.ubicacion) {
      query += ' AND ubicacion = ?';
      params.push(req.query.ubicacion);
    }
    if (req.query.inventario) {
      query += ' AND inventario = ?';
      params.push(req.query.inventario);
    }
    
    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/perros/:microchip - Detalle individual
router.get('/:microchip', async (req, res) => {
  try {
    const [perro] = await pool.execute(
      'SELECT *, DATE_FORMAT(fecha_nac, "%d/%m/%Y") as fecha_nac_fmt FROM perros WHERE microchip = ?',
      [req.params.microchip]
    );
    
    if (perro.length === 0) {
      return res.status(404).json({ success: false, error: 'Perro no encontrado' });
    }
    
    const [entrenamientos] = await pool.execute('SELECT * FROM entrenamientos WHERE microchip = ? ORDER BY fecha DESC', [req.params.microchip]);
    const [vacunas] = await pool.execute('SELECT * FROM vacunas WHERE microchip = ? ORDER BY fecha DESC', [req.params.microchip]);
    
    res.json({
      success: true,
      perro: perro[0],
      entrenamientos,
      vacunas
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/perros - Crear con foto
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const {
      microchip, nombre, raza, fecha_nac, color, sexo, 
      especialidad, ubicacion, inventario, notas
    } = req.body;
    
    // Validar campos requeridos
    if (!microchip || !nombre || !ubicacion || !inventario) {
      return res.status(400).json({ 
        success: false, 
        error: 'Microchip, nombre, ubicación e inventario son requeridos' 
      });
    }
    
    // Ruta de la foto (si existe)
    const fotoPath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const params = [
      microchip || '',
      nombre || '',
      raza || null,
      fecha_nac || null,
      color || null,
      sexo || null,
      especialidad || null,
      ubicacion || '',
      inventario || '',
      notas || null,
      fotoPath
    ];
    
    await pool.execute(`
      INSERT INTO perros (microchip, nombre, raza, fecha_nac, color, sexo, 
                         especialidad, ubicacion, inventario, notas, foto)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);
    
    res.status(201).json({ 
      success: true, 
      message: 'Perro registrado', 
      microchip,
      foto: fotoPath 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Microchip ya existe' });
    }
    console.error('POST Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/perros/:microchip - Actualizar con foto
router.put('/:microchip', upload.single('foto'), async (req, res) => {
  try {
    const fields = { ...req.body };
    
    // Si hay nueva foto, agregarla
    if (req.file) {
      fields.foto = `/uploads/${req.file.filename}`;
    }
    
    const updates = [];
    const values = [];
    
    Object.keys(fields).forEach(key => {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    });
    values.push(req.params.microchip);
    
    await pool.execute(
      `UPDATE perros SET ${updates.join(', ')} WHERE microchip = ?`,
      values
    );
    
    res.json({ success: true, message: 'Perro actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/perros/:microchip
router.delete('/:microchip', async (req, res) => {
  try {
    const result = await pool.execute('DELETE FROM perros WHERE microchip = ?', [req.params.microchip]);
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Perro no encontrado' });
    }
    
    res.json({ success: true, message: 'Perro eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
