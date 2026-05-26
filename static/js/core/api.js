// static/js/core/api.js
import { AUTH_TOKEN_KEY, forceGlobalLogout } from './session.js';

// Detector automático de entorno (Local vs Producción)
export const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.protocol === 'file:'
    ? 'http://127.0.0.1:5000' 
    : 'https://sijj2003.pythonanywhere.com';

// Generador de cabeceras Zero Trust
export function getAuthHeaders() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// 🛡️ INTERCEPTOR GLOBAL DE PETICIONES
export function setupFetchInterceptor() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
        if (typeof args[1] === 'undefined') args[1] = {};
        if (typeof args[1].credentials === 'undefined') args[1].credentials = 'include';
        
        // Inyectar automáticamente el token en CADA petición que se haga en la app
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            if (typeof args[1].headers === 'undefined') args[1].headers = {};
            if (typeof args[1].headers['Authorization'] === 'undefined') {
                args[1].headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        const response = await originalFetch.apply(this, args);
        
        // Evitamos expulsar al usuario si falla una petición de login o registro
        const requestUrl = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : '');
        const isAuthRoute = requestUrl.includes('/api/login') || 
                            requestUrl.includes('/api/register') || 
                            requestUrl.includes('/api/auth/') ||
                            requestUrl.includes('/api/admin_login');
        
        // Si el servidor nos devuelve 401 (No autorizado) expulsamos inmediatamente
        if (response.status === 401 && !isAuthRoute) {
            console.warn("🚨 Interceptor detectó un 401 del servidor. Expulsando...");
            forceGlobalLogout("Tu sesión ha expirado en el servidor. Por favor, inicia sesión nuevamente.");
        }
        
        return response;
    };
}
