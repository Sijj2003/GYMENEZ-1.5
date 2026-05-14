// --- CONFIGURACIÓN DE SEGURIDAD Y SESIÓN ---
const DEVICE_ID_KEY = 'gymen_device_id';
let localDeviceId = localStorage.getItem(DEVICE_ID_KEY);

if (!localDeviceId) {
    localDeviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, localDeviceId);
}

const API_BASE_URL = 'https://sijj2003.pythonanywhere.com'; 

let CURRENT_USER_SESSION = null; 
let sessionCheckerInterval = null; 
let isFirstCheckIgnored = false; 

const WHATSAPP_NUMBER = '+584148780392';
const WHATSAPP_MESSAGE_RECOVERY = 'Hola quisiera solicitar la recuperacion de credenciales';

async function apiLogin(email, password, deviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, deviceId })
        });
        const data = await response.json();

        if (response.status === 403) return { success: false, error: data.error || 'Acceso denegado (403).' };
        if (!response.ok || !data.success) {
            if (data.requires_activation) return { success: false, requires_activation: true, email: data.email, message: data.message };
            return { success: false, error: data.error || 'Error de conexión o credenciales inválidas.' };
        }
        CURRENT_USER_SESSION = data.user;
        localStorage.setItem('userSession', JSON.stringify(data.user)); 
        return { success: true, user: data.user };
    } catch (e) {
        return { success: false, error: 'No se pudo conectar con el servidor API REST. Verifica tu conexión.' };
    }
}

async function apiLogout() {
    try {
        let userId = (CURRENT_USER_SESSION && (CURRENT_USER_SESSION._id || CURRENT_USER_SESSION.id));
        if (!userId) {
            const storedSession = localStorage.getItem('userSession');
            if (storedSession) userId = JSON.parse(storedSession).id || JSON.parse(storedSession)._id;
        }
        if (userId) {
            await fetch(`${API_BASE_URL}/api/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, deviceId: localDeviceId })
            });
        }
    } catch (e) {
        console.error("Error al intentar cerrar sesión:", e);
    } finally {
        CURRENT_USER_SESSION = null;
        localStorage.removeItem('userSession'); 
        return { success: true }; 
    }
}

async function apiVerifySession(userId, deviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify_session`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deviceId })
        });
        const data = await response.json();
        if (response.status === 403 || !data.success) return { isValid: false, message: data.error || 'Sesión invalidada remotamente.' };
        return { isValid: true };
    } catch (e) {
        return { isValid: true }; 
    }
}

const messagebox = document.getElementById('message-box');

function showMessage(message, type = 'success') {
    if(!messagebox) return;
    messagebox.textContent = message;
    messagebox.className = ''; 
    messagebox.classList.add('transition-none', 'message-' + type);
    messagebox.style.opacity = '1';
    messagebox.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
        messagebox.removeAttribute('style'); 
        messagebox.style.opacity = '0';
        messagebox.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 3000);
}

function showCenteredMessage(message, durationMs) {
    const modal = document.getElementById('temp-message-modal');
    if(!modal) return;
    document.getElementById('temp-message-text').textContent = message;
    modal.classList.remove('hidden');
    void modal.offsetWidth; 
    modal.style.opacity = '1';
    modal.querySelector('.glass-panel').style.transform = 'scale(1)';

    setTimeout(() => {
        modal.style.opacity = '0';
        modal.querySelector('.glass-panel').style.transform = 'scale(0.9)';
        setTimeout(() => modal.classList.add('hidden'), 500); 
    }, durationMs);
}

function showForceLogoutMessage(message, type = 'error') {
    const msgBox = document.getElementById('force-logout-message');
    if(!msgBox) return;
    if (message) {
        msgBox.textContent = message;
        msgBox.className = `p-3 mb-4 rounded-lg font-bold text-center text-xs tracking-widest uppercase ${type === 'error' ? 'bg-red-900/30 border border-red-500/50 text-red-400' : 'bg-green-900/30 border border-green-500/50 text-green-400'}`;
        msgBox.classList.remove('hidden');
    } else {
        msgBox.classList.add('hidden'); 
    }
}

// -------------------------------------------------------------
// 🟢 REVISIÓN DEL HEARTBEAT (SESIÓN ACTIVA) 🟢
// -------------------------------------------------------------
const SESSION_CHECK_INTERVAL_MS = 1000; 

function startSessionChecker() {
    if (sessionCheckerInterval) clearInterval(sessionCheckerInterval);
    isFirstCheckIgnored = true; 
    checkSessionValidity(); 
    sessionCheckerInterval = setInterval(checkSessionValidity, SESSION_CHECK_INTERVAL_MS);
}

function stopSessionChecker() {
    if (sessionCheckerInterval) {
        clearInterval(sessionCheckerInterval);
        sessionCheckerInterval = null;
    }
}

async function checkSessionValidity() {
    if (isFirstCheckIgnored) {
        isFirstCheckIgnored = false; 
        return; 
    }
    
    if (!CURRENT_USER_SESSION) {
        stopSessionChecker(); 
        window.location.href = '/'; // Expulsar al login
        return;
    }

    const userId = CURRENT_USER_SESSION._id || CURRENT_USER_SESSION.id;
    const verification = await apiVerifySession(userId, localDeviceId);

    if (!verification.isValid) {
        await apiLogout(); 
        stopSessionChecker(); 
        alert('Tu sesión ha sido cerrada desde otro dispositivo o por un administrador.');
        window.location.href = '/'; // Expulsar al login
    }
}

// ---------------------------------------------------------------
// 💡 FUNCIONES DE MÁSCARA AUTOMÁTICA (FECHA, CÉDULA, TELÉFONO) 💡
// ---------------------------------------------------------------
function applyDateMask(e) {
    if (e.inputType === 'deleteContentBackward') return; 
    let v = e.target.value.replace(/\D/g, ''); 
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length >= 5) e.target.value = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
    else if (v.length >= 3) e.target.value = `${v.substring(0, 2)}/${v.substring(2)}`;
    else e.target.value = v;
}

function applyCIMask(e) {
    let v = e.target.value.replace(/\D/g, ''); 
    if (v.length > 8) v = v.substring(0, 8);
    e.target.value = v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function applyPhoneMask(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 7);
}

// -------------------------------------------------------------
// 🟢 LÓGICA DE CONTROLADORES (LOGIN, REGISTER, FORCE LOGOUT) 🟢
// -------------------------------------------------------------

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    const sessionModal = document.getElementById('active-session-modal'); 
    const blockModal = document.getElementById('block-modal'); 

    btn.disabled = true;
    btn.textContent = 'VERIFICANDO...';

    const response = await apiLogin(email, password, localDeviceId);
    
    if (!response.success) {
        btn.disabled = false;
        btn.textContent = 'INGRESAR AL PORTAL';

        if (response.requires_activation) {
            document.getElementById('activation-email').value = response.email || email;
            document.getElementById('activation-modal').classList.remove('hidden');
            setTimeout(() => document.getElementById('activation-modal').style.opacity = '1', 10);
            showMessage('Revisa tu correo para el código de seguridad.', 'success');
            return;
        }
        
        if (response.error && response.error.includes('bloqueada')) {
            blockModal.classList.remove('hidden'); 
            showMessage('Acceso Restringido.', 'error');
            setTimeout(() => blockModal.classList.add('hidden'), 10000); 
        } else if (response.error && (response.error.includes('Sesion activa detectada') || response.error.includes('sesión activa'))) {
            sessionModal.classList.remove('hidden');
            showMessage('Sesión en uso detectada.', 'error');
            document.getElementById('force-logout-form').classList.add('hidden');
            document.getElementById('modal-options').classList.remove('hidden');
            showForceLogoutMessage(''); 
        } else {
            showMessage(response.error, 'error');
        }
        return;
    } 
    
    // 🚩 SI EL LOGIN ES EXITOSO, ENVIAR AL NUEVO DASHBOARD 🚩
    window.location.href = '/apps/start/inicio.html';
}

async function handleForceLogout(e) {
    e.preventDefault();
    const email = document.getElementById('force-email').value;
    const password = document.getElementById('login-password').value; 
    const name = document.getElementById('force-name').value;
    const lastname = document.getElementById('force-lastname').value;
    
    const dob = document.getElementById('force-dob').value.trim();
    const phone = document.getElementById('force-phone').value.trim(); 
    const ci = document.getElementById('force-ci').value.trim(); 

    const btn = document.getElementById('force-logout-btn');
    const modal = document.getElementById('active-session-modal');

    btn.disabled = true;
    btn.textContent = 'VERIFICANDO DATOS...';
    showForceLogoutMessage(''); 

    try {
        const response = await fetch(`${API_BASE_URL}/api/force_logout`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, deviceId: localDeviceId, name, lastname, dob, phone, ci })
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            showForceLogoutMessage('Error: Los datos introducidos no coinciden con tu perfil o clave.', 'error');
            btn.disabled = false;
            btn.textContent = 'CONFIRMAR IDENTIDAD';
            return;
        }

        CURRENT_USER_SESSION = data.user;
        localStorage.setItem('userSession', JSON.stringify(data.user)); 
        
        modal.classList.add('hidden');
        showCenteredMessage('La sesión anterior ha sido cerrada. Ingresando...', 3000); 
        
        // 🚩 SI FORZAR EL LOGOUT FUE ÉXITOSO, MANDAR AL DASHBOARD DIRECTO 🚩
        setTimeout(() => {
            window.location.href = '/apps/start/inicio.html';
        }, 3000); 

    } catch (err) {
        showForceLogoutMessage('Error de conexión.', 'error');
        btn.disabled = false;
        btn.textContent = 'CONFIRMAR IDENTIDAD';
    }
}

// -------------------------------------------------------------
// 🟢 GESTIÓN DE RUTAS (INTELIGENCIA DEL SCRIPT) 🟢
// -------------------------------------------------------------

// 🛠 AGREGADO AQUÍ PARA EVITAR EL REFERENCE ERROR 🛠
const SPLASH_DURATION_MS = 3000; 

window.onload = function() {
    const isLoginScreen = document.getElementById('login-screen') !== null;
    const isDashboardScreen = document.getElementById('dashboard-screen') !== null;
    const storedSession = localStorage.getItem('userSession');

    // === LÓGICA PARA LA PÁGINA DE LOGIN (index.html) ===
    if (isLoginScreen) {
        if (storedSession) {
            // Ya está logueado, lo mandamos al dashboard
            window.location.href = '/apps/start/inicio.html';
            return;
        }

        // Quitar la pantalla de carga después de 3 segundos
        setTimeout(() => {
            const splash = document.getElementById('splash-
