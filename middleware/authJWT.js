const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'clave-secreta-k9-mobile';

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    if (req.accepts('html')) return res.redirect('/');
    return res.status(401).json({ message: 'No autorizado. Inicia sesión.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    if (req.accepts('html')) return res.redirect('/');
    return res.status(401).json({ message: 'Sesión expirada. Inicia sesión.' });
  }
}

module.exports = verificarToken;
