// Wrapper fetch con JWT automático
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('k9_token');
  
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      }
    };
  
    const res = await fetch(url, config);
  
    // Token expirado → logout automático
    if (res.status === 401) {
      localStorage.removeItem('k9_token');
      localStorage.removeItem('k9_user');
      window.location.href = '/';
      return null;
    }
  
    return res;
  }
  
  // Cerrar sesión
  function logout() {
    localStorage.removeItem('k9_token');
    localStorage.removeItem('k9_user');
    window.location.href = '/';
  }
  