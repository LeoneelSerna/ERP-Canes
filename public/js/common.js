// ========== INSERTAR LOADER + NAVBAR AUTOMÁTICAMENTE ==========
document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = document.querySelector('.login-box');
    
    // 1. Insertar Loader (en todas las páginas)
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
  
    // 2. Insertar Navbar (solo si NO es login y no existe ya)
    if (!isLoginPage && !document.querySelector('.admin-nav')) {
      const nav = document.createElement('nav');
      nav.className = 'admin-nav';
      nav.innerHTML = `
        <div class="nav-left">
          <h2 style="color: #4ecca3; margin: 0;">🐕 ERP K9 Admin</h2>
        </div>
        <div class="nav-right">
          <a href="/dashboard" class="nav-btn nav-dashboard">Dashboard</a>
          <a href="/admin" class="nav-btn">Admin</a>
          <button onclick="logout()" class="nav-btn nav-btn-logout">Salir</button>
        </div>
      `;
      document.body.insertBefore(nav, document.body.firstChild);
    }
  });
  
  // ========== OCULTAR LOADER AL CARGAR ==========
  window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 300);
      }, 300);
    }
  });
  
  // ========== LOGOUT ==========
  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Error logout:', e);
    } finally {
      window.location.href = '/';
    }
  }
  
  // ========== CHECK AUTH ==========
  async function checkAuth(redirectToLogin = true) {
    try {
      const res = await fetch('/api/session');
      if (res.status === 401) {
        if (redirectToLogin && !window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return null;
      }
      return res.status === 200 ? await res.json() : null;
    } catch (e) {
      console.error('Error auth:', e);
      return null;
    }
  }
  
  // ========== CARGAR SESIÓN (Dashboard/Admin) ==========
  async function loadSessionData() {
    try {
      const session = await checkAuth();
      if (!session) return null;
  
      // Actualizar elementos si existen
      const emailEl = document.getElementById('userEmail');
      const userIdEl = document.getElementById('userId');
      
      if (emailEl) emailEl.textContent = session.email;
      if (userIdEl) userIdEl.textContent = session.id?.toString().slice(-6) || 'N/A';
  
      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }
  
  // ========== CARGAR TOTAL USUARIOS ==========
  async function loadTotalUsers() {
    try {
      const res = await fetch('/api/auth/users');
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
  
  // ========== EXPORTS GLOBALES ==========
  window.logout = logout;
  window.checkAuth = checkAuth;
  window.loadSessionData = loadSessionData;
  window.loadTotalUsers = loadTotalUsers;
  window.showMessage = showMessage;
  window.irPerfilPerro = irPerfilPerro;
  