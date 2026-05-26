// static/js/auth/admin_auth.js

import { API_BASE_URL } from '../core/api.js';
import { showMessage } from '../utils/ui.js';
import { localDeviceId } from '../core/session.js';

// 🌉 PUENTE GLOBAL: 
// Exponemos estas variables a 'window' para que los scripts inline 
// de los paneles de administración sigan funcionando sin romperse.
window.API_BASE_URL = API_BASE_URL;
window.showMessage = showMessage;

// =================================================================
// 🛡️ INTERCEPTOR GLOBAL DE PETICIONES ADMINISTRATIVAS
// =================================================================
export function setupAdminInterceptor() {
    const originalAdminFetch = window.fetch;
    window.fetch = async function(...args) {
        if (typeof args[1] === 'undefined') args[1] = {};
        if (typeof args[1].credentials === 'undefined') args[1].credentials = 'include';
        
        const adminToken = localStorage.getItem('admin_token');
        if (adminToken) {
            if (typeof args[1].headers === 'undefined') args[1].headers = {};
            args[1].headers['Authorization'] = `Bearer ${adminToken}`;
        }
        
        const response = await originalAdminFetch.apply(this, args);

        const requestUrl = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : '');
        const isAuthRoute = requestUrl.includes('/api/admin_login') || requestUrl.includes('/api/admin/logout');
        
        if (response.status === 401 && !isAuthRoute) {
            console.warn("🚨 Credencial Administrativa Expirada. Ejecutando expulsión...");
            localStorage.removeItem('adminSession');
            localStorage.removeItem('admin_token');
            window.location.href = 'login.html';
        }

        return response;
    };
}

// =================================================================
// 🔐 LÓGICA DE LOGIN Y LOGOUT
// =================================================================
async function handleAdminLogin(event) {
    event.preventDefault(); 
    const btn = document.getElementById('login-button');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="tracking-[0.5em] animate-pulse">AUTENTICANDO...</span>`;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin_login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, deviceId: localDeviceId })
        });

        if (response.status === 429) {
            showMessage("Múltiples intentos. Sistema bloqueado por 60 seg.", "error");
            btn.disabled = false;
            btn.textContent = "VERIFICAR CREDENCIALES";
            return;
        }

        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem('adminSession', JSON.stringify(data.admin));
            localStorage.setItem('admin_token', data.token);

            showMessage("ACCESO CONCEDIDO. INICIANDO NÚCLEO...", "success");
            setTimeout(() => window.location.href = 'inicio.html', 1200);
        } else {
            showMessage(data.error || "ACCESO DENEGADO", "error");
            btn.disabled = false;
            btn.textContent = "VERIFICAR CREDENCIALES";
        }
    } catch (error) {
        showMessage("ERROR DE CONEXIÓN CON EL NÚCLEO", "error");
        btn.disabled = false;
        btn.textContent = "REINTENTAR ACCESO";
    }
}

export async function handleAdminLogout() {
    try {
        await fetch(`${API_BASE_URL}/api/admin/logout`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error("Fallo al cerrar sesión en el servidor:", e);
    } finally {
        localStorage.removeItem('adminSession');
        localStorage.removeItem('admin_token');
        window.location.href = 'login.html';
    }
}

// =================================================================
// 🚀 INICIALIZACIÓN GLOBAL
// =================================================================
window.addEventListener('DOMContentLoaded', () => {
    setupAdminInterceptor(); // Activamos el escudo para todas las peticiones

    const isLoginScreen = document.getElementById('admin-login-form') !== null;
    const isDashboardScreen = document.getElementById('admin-name-display') !== null;
    const storedSession = localStorage.getItem('adminSession');

    if (isLoginScreen) {
        if (storedSession) {
            window.location.href = 'inicio.html';
            return;
        }
        document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);
    }

    if (isDashboardScreen) {
        if (!storedSession) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const adminData = JSON.parse(storedSession);
            document.getElementById('admin-name-display').textContent = adminData.name || 'Admin';
        } catch(e) {
            handleAdminLogout();
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleAdminLogout);
    }
});
