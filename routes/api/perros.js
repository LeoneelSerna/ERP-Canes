const express = require('express');
const pool = require('../../models/database');
const router = express.Router();

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

// GET /api/perros/:microchip
router.get('/:microchip', async (req, res) => {
  try {
    const [perro] = await pool.execute(
      'SELECT *, DATE_FORMAT(fecha_nac, "%d/%m/%Y") as fecha_nac_fmt FROM perros WHERE microchip = ?',
      [req.params.microchip]
    );
    
    if (perro.length === 0) {
      return res.status(404).json({ success: false, error: 'Perro no encontrado' });
    }
    
    // Cargar datos relacionados
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

// POST /api/perros - Crear perro
router.post('/', async (req, res) => {
    try {
      const {
        microchip, nombre, raza, fecha_nac, color, sexo, 
        especialidad, ubicacion, inventario, notas, foto
      } = req.body;
      
      // ✅ Convertir undefined/null a valores seguros
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
        foto || null
      ];
      
      // Validar campos requeridos
      if (!microchip || !nombre || !ubicacion || !inventario) {
        return res.status(400).json({ 
          success: false, 
          error: 'Microchip, nombre, ubicación e inventario son requeridos' 
        });
      }
      
      await pool.execute(`
        INSERT INTO perros (microchip, nombre, raza, fecha_nac, color, sexo, 
                           especialidad, ubicacion, inventario, notas, foto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, params);
      
      res.status(201).json({ success: true, message: 'Perro registrado', microchip });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, error: 'Microchip ya existe' });
      }
      console.error('POST Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
// PUT /api/perros/:microchip - Actualizar
router.put('/:microchip', async (req, res) => {
  try {
    const fields = req.body;
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
    
    res.json({ success: true, message: 'Perro eliminado (con entrenamientos/vacunas)' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/perros/filtros?ubicacion=Tijuana&inventario=servicio
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

module.exports = router;
