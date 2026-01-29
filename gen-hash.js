// Archivo temp: gen-hash.js
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10, (err, hash) => {
  console.log('Hash:', hash);
});
