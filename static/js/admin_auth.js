// static/js/admin_auth.js - System Core Intelligence
const API_BASE_URL = "https://sijj2003.pythonanywhere.com"; 

function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

function showMessage(message, type = 'success') {
    const box = document.getElementById('message-box');
    if(!box) return;
    box.textContent = message;
    
    // Colores basados en el tema Índigo/Core
    if(type === 'success') {
        box.classList.add('bg-indigo-600', 'text-white', 'border-indigo-400');
        box.classList.remove('bg-red-600', 'border-red-400');
    } else {
        box.classList.add('bg-red-600', 'text-white', 'border-red-400');
        box.classList.remove('bg-indigo-600', 'border-indigo-400');
    }
    
    box.classList.remove('opacity-0', 'translate-y-[-20px]');
    box.classList.add('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
        box.classList.add('opacity-0', 'translate-y-[-20px]');
    }, 4000);
}

// ---------------------------------------------
// LÓGICA DE LOGIN (login.html)
// ---------------------------------------------
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
            body: JSON.stringify({ email, password, deviceId: getDeviceId() })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            // Guardar datos de sesión visual
            localStorage.setItem('adminSession', JSON.stringify(data.admin));
            // 🔴 CRÍTICO: Guardar el token de seguridad para las siguientes peticiones
            localStorage.setItem('admin_token', data.token);

            showMessage("ACCESO CONCEDIDO. INICIANDO NÚCLEO...");
            // Redirigir al archivo separado del Dashboard
            setTimeout(() => {
                window.location.href = 'inicio.html';
            }, 1200);
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

function handleLogout() {
    // Eliminar tanto la sesión visual como el token criptográfico
    localStorage.removeItem('adminSession');
    localStorage.removeItem('admin_token');
    
    // Redirigir de vuelta al login
    window.location.href = 'login.html';
}

// ---------------------------------------------
// INICIALIZACIÓN GLOBAL SEGÚN LA PÁGINA
// ---------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    const isLoginScreen = document.getElementById('admin-login-form') !== null;
    const isDashboardScreen = document.getElementById('admin-name-display') !== null;
    const storedSession = localStorage.getItem('adminSession');
    const storedToken = localStorage.getItem('admin_token');

    // 1. Si estamos en la página de Login
    if (isLoginScreen) {
        // Si ya está logueado y tiene token, mandarlo al dashboard directamente
        if (storedSession && storedToken) {
            window.location.href = 'inicio.html';
            return;
        }
        // Si faltaba el token pero había sesión fantasma, limpiarla por seguridad
        if (storedSession && !storedToken) handleLogout();

        document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);
    }

    // 2. Si estamos en el Dashboard
    if (isDashboardScreen) {
        // Si NO está logueado o falta el token, patearlo al login
        if (!storedSession || !storedToken) {
            window.location.href = 'login.html';
            return;
        }
        
        // Cargar el nombre del administrador
        try {
            const adminData = JSON.parse(storedSession);
            document.getElementById('admin-name-display').textContent = adminData.name || 'Admin';
        } catch(e) {
            handleLogout();
        }

        // Configurar botón de cerrar sesión
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    }
});
