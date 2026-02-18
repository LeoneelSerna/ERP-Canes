// ========== INSERTAR LOADER + NAVBAR ==========
document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = document.querySelector('.login-box');

  // 1. Loader (todas las páginas)
  if (!document.getElementById('pageLoader')) {
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #0f1419; display: flex; align-items: center; justify-content: center;
      z-index: 9999; transition: opacity 0.3s ease;
    `;
    loader.innerHTML = '<div style="color: #4ecca3; font-size: 1.5rem;">⏳ Cargando...</div>';
    document.body.insertBefore(loader, document.body.firstChild);
  }

  // 2. Navbar (solo si NO es login)
  if (!isLoginPage && !document.querySelector('.admin-nav')) {
    const user = JSON.parse(localStorage.getItem('k9_user') || '{}');
    const nav = document.createElement('nav');
    nav.className = 'admin-nav';
    nav.innerHTML = `
      <div class="nav-left">
        <h2 style="color: #4ecca3; margin: 0;">🐕 ERP K9</h2>
      </div>
      <div class="nav-right" id="navMenu">
        <span class="nav-email">${user.email || ''}</span>
        <a href="/dashboard" class="nav-btn nav-dashboard">Dashboard</a>
        <a href="/admin" class="nav-btn">Admin</a>
        <button onclick="logout()" class="nav-btn nav-btn-logout">Salir</button>
      </div>
      <button class="nav-hamburger" id="navToggle" onclick="toggleMenu()">☰</button>
    `;
    document.body.insertBefore(nav, document.body.firstChild);
  }

}); // ← ¡ESTE ERA EL QUE FALTABA!

// ========== OCULTAR LOADER ==========
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 300);
    }, 300);
  }
});

// ========== LOGOUT (JWT + sesión) ==========
async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {
    console.error('Error logout:', e);
  } finally {
    localStorage.removeItem('k9_token');
    localStorage.removeItem('k9_user');
    window.location.href = '/';
  }
}

// ========== CHECK AUTH (JWT) ==========
async function checkAuth(redirectToLogin = true) {
  const token = localStorage.getItem('k9_token');

  if (!token) {
    if (redirectToLogin) window.location.href = '/';
    return null;
  }

  try {
    const res = await fetch('/api/auth/verify', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    if (!data.valid) {
      localStorage.removeItem('k9_token');
      localStorage.removeItem('k9_user');
      if (redirectToLogin) window.location.href = '/';
      return null;
    }

    return data.user;
  } catch (e) {
    if (redirectToLogin) window.location.href = '/';
    return null;
  }
}

// ========== CARGAR SESIÓN ==========
async function loadSessionData() {
  try {
    const user = await checkAuth();
    if (!user) return null;

    const emailEl = document.getElementById('userEmail');
    const userIdEl = document.getElementById('userId');

    if (emailEl) emailEl.textContent = user.email;
    if (userIdEl) userIdEl.textContent = user.id?.toString().slice(-6) || 'N/A';

    return user;
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
}

// ========== CARGAR TOTAL USUARIOS ==========
async function loadTotalUsers() {
  try {
    const token = localStorage.getItem('k9_token');
    const res = await fetch('/api/auth/users', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    const totalEl = document.getElementById('totalUsers');
    if (totalEl) totalEl.textContent = data.count || 0;
  } catch (e) {
    console.error('Error loading users:', e);
  }
}

// ========== UTILS ==========
function showMessage(message, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  alert(`${icons[type] || ''} ${message}`);
}

// ========== NAVEGACIÓN AL PERFIL ==========
function irPerfilPerro(microchip) {
  window.location.href = `/perro.html?microchip=${encodeURIComponent(microchip)}`;
}

// ========== TOGGLE MENÚ MÓVIL ==========
function toggleMenu() {
  const menu = document.getElementById('navMenu');
  const btn = document.getElementById('navToggle');
  menu.classList.toggle('nav-open');
  btn.textContent = menu.classList.contains('nav-open') ? '✕' : '☰';
}

// ========== EXPORTS GLOBALES ==========
window.logout = logout;
window.checkAuth = checkAuth;
window.loadSessionData = loadSessionData;
window.loadTotalUsers = loadTotalUsers;
window.showMessage = showMessage;
window.irPerfilPerro = irPerfilPerro;
window.toggleMenu = toggleMenu;

// ========== REGISTRO SERVICE WORKER ==========
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(r => console.log('✅ SW registrado:', r.scope))
    .catch(e => console.error('❌ SW error:', e));
}