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

// Interceptor administrativo para inyectar cabeceras cruzadas y credenciales de protección
const originalAdminFetch = window.fetch;
window.fetch = async function(...args) {
    if (typeof args[1] === 'undefined') args[1] = {};
    if (typeof args[1].credentials === 'undefined') args[1].credentials = 'include';
    
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
        if (typeof args[1].headers === 'undefined') args[1].headers = {};
        args[1].headers['Authorization'] = `Bearer ${adminToken}`;
    }
    return originalAdminFetch.apply(this, args);
};

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
            localStorage.setItem('adminSession', JSON.stringify(data.admin));
            localStorage.setItem('admin_token', data.token); // Guardamos token salvavidas administrativamente

            showMessage("ACCESO CONCEDIDO. INICIANDO NÚCLEO...");
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

async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/api/admin/logout`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error(e);
    } finally {
        localStorage.removeItem('adminSession');
        localStorage.removeItem('admin_token');
        window.location.href = 'login.html';
    }
}

// ---------------------------------------------
// INICIALIZACIÓN GLOBAL SEGÚN LA PÁGINA
// ---------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
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
            handleLogout();
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    }
});
