# 🐕 ERP K9 - Sistema de Gestión de Perros K9

<div align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![GitHub last commit](https://img.shields.io/github/last-commit/LeoneelSerna/ERP-Canes)
![GitHub repo size](https://img.shields.io/github/repo-size/LeoneelSerna/ERP-Canes)

**Sistema completo de gestión para perros de servicio K9 con control de inventario, entrenamientos, vacunas y perfiles detallados.**

[🚀 Instalación](#-instalación) • [📸 Screenshots](#-capturas) • [✨ Características](#-características) • [🛠️ Tech Stack](#%EF%B8%8F-tecnologías)

</div>

---

## ✨ Características

### 🔐 Sistema de Autenticación
- ✅ Login/Registro seguro con **bcrypt**
- ✅ Autenticación persistente con **JWT** (tokens de 7 días)
- ✅ Sesión activa al cerrar y reabrir la app
- ✅ Protección de rutas privadas con middleware JWT
- ✅ Logout automático al expirar el token

### 📱 PWA (Progressive Web App)
- ✅ **Instalable** en Android e iOS desde el navegador
- ✅ **Service Worker** registrado y activo
- ✅ Pantalla completa al abrir desde ícono home
- ✅ Compatible con HTTPS (ngrok/deploy)
- ✅ Manifest configurado con íconos 192x512

### 🐾 Gestión de Perros K9
- ✅ **CRUD completo** (Create, Read, Update, Delete)
- ✅ Upload de **fotografías** con preview
- ✅ Perfiles individuales detallados
- ✅ **Lightbox** para ver fotos en pantalla completa
- ✅ Campos: microchip, nombre, raza, fecha nacimiento, sexo, especialidad, ubicación, inventario

### 📊 Panel Administrativo
- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ Tabla con **filtros avanzados** (ubicación, búsqueda)
- ✅ Vista de lista y vista de tarjetas
- ✅ Botones de edición y eliminación

### 📚 Control de Entrenamientos y Vacunas
- ✅ Registro de entrenamientos por perro
- ✅ Control de vacunas con fechas
- ✅ Historial completo en perfil individual

### 🎨 Interfaz Moderna
- ✅ Diseño **glassmorphism** oscuro
- ✅ Totalmente **responsive** (móvil/tablet/desktop)
- ✅ **Navbar con menú hamburguesa** en móvil
- ✅ Fix **safe area iOS** (notch/Dynamic Island)
- ✅ Animaciones suaves
- ✅ Experiencia de usuario intuitiva
---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|-----------|
| **Backend** | Node.js + Express.js |
| **Base de Datos** | MySQL 8.0 |
| **Autenticación** | bcryptjs + JWT (jsonwebtoken) |
| **Sesiones** | express-session |
| **Upload** | Multer (fotos hasta 5MB) |
| **Frontend** | HTML5 + CSS3 + JavaScript Vanilla |
| **Estilos** | CSS Moderno (Flexbox/Grid) |
| **PWA** | Service Worker + Web App Manifest |

---

## 📦 Instalación

### Prerrequisitos

- [Node.js](https://nodejs.org/) >= 14.0
- [MySQL](https://www.mysql.com/) >= 8.0
- npm o yarn

### 1️⃣ Clonar repositorio

```bash
git clone https://github.com/LeoneelSerna/ERP-Canes.git
cd ERP-Canes
```
### 2️⃣ Instalar dependencias
```bash
npm install
```
| Paquete         | Versión | Uso                           |
| --------------- | ------- | ----------------------------- |
| express         | ^4.18.0 | Servidor web                  |
| mysql2          | ^3.0.0  | Conexión a MySQL              |
| bcryptjs        | ^2.4.3  | Encriptación de contraseñas   |
| jsonwebtoken    | ^9.0.0  | Autenticación JWT persistente |
| express-session | ^1.17.3 | Manejo de sesiones servidor   |
| multer          | ^1.4.5  | Subida de fotos (max 5MB)     |
| cors            | ^2.8.5  | Cross-Origin Resource Sharing |
| dotenv          | ^16.0.0 | Variables de entorno          |
| nodemon         | ^3.0.0  | Auto-reload en desarrollo     |

### 3️⃣ Configurar base de datos
Crea la base de datos en MySQL:
```bash
sql
CREATE DATABASE ics_k9;
USE ics_k9;
```
Ejecuta las siguientes tablas:
```bash
sql
-- Tabla de usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de perros
CREATE TABLE perros (
  microchip VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  raza VARCHAR(100),
  fecha_nac DATE,
  color VARCHAR(50),
  sexo CHAR(1),
  especialidad VARCHAR(50),
  ubicacion VARCHAR(50) NOT NULL,
  inventario VARCHAR(50) NOT NULL,
  notas TEXT,
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de entrenamientos
CREATE TABLE entrenamientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  microchip VARCHAR(50),
  tipo VARCHAR(100),
  fecha DATE,
  notas TEXT,
  FOREIGN KEY (microchip) REFERENCES perros(microchip) ON DELETE CASCADE
);

-- Tabla de vacunas
CREATE TABLE vacunas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  microchip VARCHAR(50),
  vacuna VARCHAR(100),
  fecha DATE,
  notas TEXT,
  FOREIGN KEY (microchip) REFERENCES perros(microchip) ON DELETE CASCADE
);
```

### 4️⃣ Configurar variables de entorno
Copia el archivo de ejemplo:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
Edita .env con tus credenciales:

text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=ics_k9
DB_PORT=3306
SESSION_SECRET=cambia_esto_por_algo_aleatorio_y_seguro
PORT=3000
```
### 5️⃣ Crear usuario administrador
Genera un hash de contraseña:

```bash
node -e "require('bcryptjs').hash('admin123', 10, (e,h) => console.log(h))"
Inserta el usuario en MySQL (reemplaza HASH_GENERADO por el resultado anterior):

sql
INSERT INTO users (username, email, password) 
VALUES ('admin', 'admin@k9.com', 'HASH_GENERADO');
```

### 6️⃣ Crear carpeta de uploads
```bash
mkdir public/uploads
```

### 7️⃣ Iniciar servidor
```bash
node app.js
```
Abre en tu navegador: http://localhost:3000

---
## 🔑 Credenciales de Prueba
Email: admin@k9.com
Password: admin123

⚠️ Importante: Cambia estas credenciales en producción.
---
## 📸 Capturas
Próximamente: Agrega aquí screenshots del sistema
---
## 🔒 Seguridad
✅ Contraseñas hasheadas con bcrypt (10 salt rounds)

✅ Sesiones seguras con express-session

✅ Validación de archivos (solo imágenes, max 5MB)

✅ Variables sensibles en .env (excluido de Git)

✅ Prevención de SQL Injection con prepared statements

✅ CORS configurado correctamente
---
### 🚀 Roadmap
 ◻️ Exportar reportes a PDF/Excel

 ◻️ Gráficas de estadísticas

 ◻️ Sistema de roles (Admin/Usuario/Veterinario)

 ◻️ Notificaciones de vacunas vencidas

 ◻️ API REST completa para móvil

 ◻️ Deploy en la nube (AWS/Railway/Render)
---
## 🤝 Contribuir
Las contribuciones son bienvenidas. Por favor:

Fork el proyecto

Crea una rama (git checkout -b feature/nueva-funcionalidad)

Commit tus cambios (git commit -m 'Add: nueva funcionalidad')

Push a la rama (git push origin feature/nueva-funcionalidad)

Abre un Pull Request

¡Listo! 🚀
---


## 📝 Licencia
Este proyecto está bajo la Licencia MIT. Ver archivo LICENSE para más detalles.

## 👨‍💻 Autor
Leoneel Serna
GitHub: @LeoneelSerna

## ⭐ Agradecimientos
Si este proyecto te fue útil, dale una estrella ⭐ en GitHub.

<div align="center">
Hecho con ❤️ para la gestión profesional de perros K9

</div>
