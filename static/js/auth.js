// --- CONFIGURACIÓN DE SEGURIDAD Y SESIÓN ---
const DEVICE_ID_KEY = 'gymen_device_id';
let localDeviceId = localStorage.getItem(DEVICE_ID_KEY);

if (!localDeviceId) {
    localDeviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, localDeviceId);
}

// 🚀 URL BASE DE TU API
const API_BASE_URL = 'https://sijj2003.pythonanywhere.com'; 

let CURRENT_USER_SESSION = null; 
let sessionCheckerInterval = null; 
let isFirstCheckIgnored = false; 

// --- CONSTANTES PARA WHATSAPP ---
const WHATSAPP_NUMBER = '+584148780392';
const WHATSAPP_MESSAGE_RECOVERY = 'Hola quisiera solicitar la recuperacion de credenciales';

/**
 * Llama a la API REST para iniciar sesión y obtener el token/objeto de usuario.
 */
async function apiLogin(email, password, deviceId) {
    console.log(`API: Llamada a ${API_BASE_URL}/api/login para ${email}. Device ID: ${deviceId}`);

    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, deviceId })
        });

        const data = await response.json();

        if (response.status === 403) {
             return { success: false, error: data.error || 'Acceso denegado (403).' };
        }
        
        if (!response.ok || !data.success) {
            if (data.requires_activation) {
                return { 
                    success: false, 
                    requires_activation: true, 
                    email: data.email, 
                    message: data.message 
                };
            }
            return { success: false, error: data.error || 'Error de conexión con la API o credenciales inválidas.' };
        }

        CURRENT_USER_SESSION = data.user;
        localStorage.setItem('userSession', JSON.stringify(data.user)); 
        return { success: true, user: data.user };

    } catch (e) {
        console.error("Error en la conexión fetch:", e);
        return { success: false, error: 'No se pudo conectar con el servidor API REST. Verifica tu conexión.' };
    }
}

/**
 * Llama a la API REST para cerrar sesión y limpiar el activeSessionId en la DB.
 */
async function apiLogout() {
    console.log(`API: Llamada a ${API_BASE_URL}/api/logout`);
    
    try {
        let userId = (CURRENT_USER_SESSION && (CURRENT_USER_SESSION._id || CURRENT_USER_SESSION.id));
        
        if (!userId) {
            const storedSession = localStorage.getItem('userSession');
            if (storedSession) {
                const storedUser = JSON.parse(storedSession);
                userId = storedUser._id || storedUser.id;
            }
        }

        if (userId) {
            await fetch(`${API_BASE_URL}/api/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userId: userId,
                    deviceId: localDeviceId 
                })
            });
        }
        
    } catch (e) {
        console.error("Error al intentar cerrar sesión en el servidor:", e);
    } finally {
        CURRENT_USER_SESSION = null;
        localStorage.removeItem('userSession'); 
        return { success: true }; 
    }
}

/**
 * Llama a la API REST para verificar si el deviceId actual sigue siendo el activo.
 */
async function apiVerifySession(userId, deviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify_session`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, deviceId })
        });

        const data = await response.json();
        
        if (response.status === 403 || !data.success) {
            return { isValid: false, message: data.error || 'Sesión invalidada remotamente.' };
        }
        
        return { isValid: true };

    } catch (e) {
        console.warn("API: Falló el chequeo de sesión (posiblemente servidor offline).", e);
        return { isValid: true }; 
    }
}

async function loadDashboardData() {
    if (!CURRENT_USER_SESSION) return;
    console.log("Dashboard cargado solo con los accesos directos.");
}

const SPLASH_DURATION_MS = 3000; 
const screens = ['splash-screen', 'login-screen', 'dashboard-screen'];
const messagebox = document.getElementById('message-box');
const body = document.body;

function showMessage(message, type = 'success') {
    messagebox.textContent = message;
    messagebox.className = ''; 
    messagebox.classList.add('transition-none');
    messagebox.classList.add('message-' + type);
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
    const textElement = document.getElementById('temp-message-text');

    textElement.textContent = message;
    modal.classList.remove('hidden');
    
    void modal.offsetWidth; 
    
    modal.style.opacity = '1';
    modal.querySelector('.glass-panel').style.transform = 'scale(1)';

    setTimeout(() => {
        modal.style.opacity = '0';
        modal.querySelector('.glass-panel').style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 500); 
    }, durationMs);
}

function showForceLogoutMessage(message, type = 'error') {
    const msgBox = document.getElementById('force-logout-message');
    if (message) {
        msgBox.textContent = message;
        msgBox.className = `p-3 mb-4 rounded-lg font-bold text-center text-xs tracking-widest uppercase ${type === 'error' ? 'bg-red-900/30 border border-red-500/50 text-red-400' : 'bg-green-900/30 border border-green-500/50 text-green-400'}`;
        msgBox.classList.remove('hidden');
    } else {
        msgBox.classList.add('hidden'); 
    }
}

function navigateTo(targetId) {
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            screen.classList.add('hidden');
        }
    });
    const targetScreen = document.getElementById(targetId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.style.opacity = '0';
        targetScreen.style.transition = 'opacity 0.5s ease-in';
        requestAnimationFrame(() => {
            targetScreen.style.opacity = '1';
        });
        
        if (targetId === 'dashboard-screen') {
            const storedSession = localStorage.getItem('userSession');
            if (storedSession) {
                CURRENT_USER_SESSION = JSON.parse(storedSession);
            }

            if (CURRENT_USER_SESSION) {
                loadDashboardData(); 
                startSessionChecker(); 
            }
        } else {
            stopSessionChecker(); 
        }
    }
}

const SESSION_CHECK_INTERVAL_MS = 1000; 

function startSessionChecker() {
    if (sessionCheckerInterval) {
        clearInterval(sessionCheckerInterval);
    }
    isFirstCheckIgnored = true; 
    checkSessionValidity(); 
    sessionCheckerInterval = setInterval(checkSessionValidity, SESSION_CHECK_INTERVAL_MS);
    console.log(`Chequeo de sesión iniciado cada ${SESSION_CHECK_INTERVAL_MS/1000}s. Device ID: ${localDeviceId}`);
}

function stopSessionChecker() {
    if (sessionCheckerInterval) {
        clearInterval(sessionCheckerInterval);
        sessionCheckerInterval = null;
        console.log("Chequeo de sesión detenido.");
    }
}

async function checkSessionValidity() {
    if (isFirstCheckIgnored) {
        console.log("Heartbeat: Primer chequeo ignorado después del login exitoso.");
        isFirstCheckIgnored = false; 
        return; 
    }
    
    if (!CURRENT_USER_SESSION) {
        stopSessionChecker(); 
        if (!document.getElementById('login-screen').classList.contains('hidden')) return;
        navigateTo('login-screen'); 
        return;
    }

    const userId = CURRENT_USER_SESSION._id || CURRENT_USER_SESSION.id;
    
    const verification = await apiVerifySession(userId, localDeviceId);

    if (!verification.isValid) {
        console.warn("Sesión Invalidada: Cerrada desde otro dispositivo.");
        await apiLogout(); 
        
        stopSessionChecker(); 
        navigateTo('login-screen'); 
        showMessage('Tu sesión fue cerrada en este dispositivo.', 'error');
    }
}

function transitionToLogin() {
    const splashScreen = document.getElementById('splash-screen');
    splashScreen.style.transition = 'opacity 1s ease-out';
    splashScreen.style.opacity = '0';

    setTimeout(() => {
        splashScreen.style.display = 'none';
        navigateTo('login-screen'); 
    }, 1000); 
}

function formatDateInput(input) {
    let value = input.value.replace(/\D/g, ''); 
    
    if (value.length > 8) { 
        value = value.substring(0, 8);
    }

    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length > 5) { 
        value = value.substring(0, 5) + '/' + value.substring(5);
    }
    input.value = value;
}

async function apiForceLogout(email, password, deviceId, name, lastname, dob, phone, ci) {
    console.log(`API: Llamada a ${API_BASE_URL}/api/force_logout para forzar el cierre de sesión de ${email}.`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/force_logout`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, deviceId, name, lastname, dob, phone, ci })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return { success: false, error: data.error || 'Error al intentar forzar el cierre de sesión.' };
        }

        CURRENT_USER_SESSION = data.user;
        localStorage.setItem('userSession', JSON.stringify(data.user)); 
        return { success: true, user: data.user };

    } catch (e) {
        console.error("Error en la conexión fetch para force_logout:", e);
        return { success: false, error: 'No se pudo conectar con el servidor para forzar el cierre.' };
    }
}

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
            openActivationModal();
            showMessage('Revisa tu correo para el código de seguridad.', 'success');
            return;
        }
        
        if (response.error && response.error.includes('bloqueada')) {
            blockModal.classList.remove('hidden'); 
            showMessage('Acceso Restringido.', 'error');
            
            setTimeout(() => {
                blockModal.classList.add('hidden');
            }, 10000); 
        
        // 🟢 AQUÍ ESTÁ LA CORRECCIÓN CLAVE: Ahora busca la frase exacta de tu backend Python 🟢
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
    
    showMessage('¡Inicio de sesión exitoso!', 'success');
    navigateTo('dashboard-screen');
    sessionModal.classList.add('hidden'); 
    
    btn.disabled = false;
    btn.textContent = 'INGRESAR AL PORTAL';
}

async function handleRegister(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]') || document.getElementById('reg-submit-btn');
    const originalText = btn ? btn.textContent : 'Crear Cuenta';

    const ciType = document.getElementById('reg-ci-type').value;
    const ciNumber = document.getElementById('reg-ci').value.trim();
    const fullCI = `${ciType}-${ciNumber}`; 

    const phonePrefix = document.getElementById('reg-phone-prefix').value;
    const phoneNum = document.getElementById('reg-phone-num').value.trim();
    const fullPhone = `${phonePrefix}-${phoneNum}`; 

    const data = {
        email: document.getElementById('reg-email').value.trim().toLowerCase(),
        password: document.getElementById('reg-password').value,
        name: document.getElementById('reg-name').value.trim(),
        last_name: document.getElementById('reg-lastname').value.trim(),
        id_number: fullCI,        
        phone_number: fullPhone,  
        dob: document.getElementById('reg-dob').value.trim(), 
        sex: document.getElementById('reg-sex').value
    };

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'PROCESANDO...';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.status === 429) {
            const responseText = await response.text();
            let errorMsg = 'Acceso restringido temporalmente por seguridad.';
            try {
                const errorData = JSON.parse(responseText);
                errorMsg = errorData.error || errorMsg;
            } catch (jsonErr) {
                if (responseText) errorMsg = responseText; 
            }
            showMessage(errorMsg, 'error');
            return; 
        }

        const res = await response.json();
        
        if (response.ok && res.success) {
            showMessage('¡Perfil creado! Revisa tu correo e inicia sesión para activar tu cuenta.', 'success');
            if (typeof handleCloseRegisterModal === 'function') {
                handleCloseRegisterModal();
            }
            e.target.reset(); 
        } else {
            showMessage(res.error || 'No se pudo completar el perfil.', 'error');
        }

    } catch (err) {
        console.error('Error en registro:', err);
        showMessage('Error de conexión. Inténtalo más tarde.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

async function handleForceLogout(e) {
    e.preventDefault();
    const email = document.getElementById('force-email').value;
    const password = document.getElementById('login-password').value; 
    const name = document.getElementById('force-name').value;
    const lastname = document.getElementById('force-lastname').value;
    const dob = document.getElementById('force-dob').value;
    
    const phoneInput = document.getElementById('force-phone').value;
    const phone = phoneInput.replace(/\D/g, ''); 
    
    const ciInput = document.getElementById('force-ci').value;
    const ci = ciInput.replace(/\D/g, ''); 

    const btn = document.getElementById('force-logout-btn');
    const modal = document.getElementById('active-session-modal');

    btn.disabled = true;
    btn.textContent = 'VERIFICANDO DATOS...';
    showForceLogoutMessage(''); 

    const response = await apiForceLogout(email, password, localDeviceId, name, lastname, dob, phone, ci);

    if (response.success) {
        const delayMs = 7000;
        modal.classList.add('hidden');
        showCenteredMessage('La sesión anterior ha sido cerrada. Ingresa de nuevo.', delayMs); 

        localStorage.removeItem('userSession');
        CURRENT_USER_SESSION = null; 
        
        setTimeout(() => {
            navigateTo('login-screen');
            document.getElementById('login-password').value = '';
        }, delayMs); 

    } else {
        showForceLogoutMessage('Error: Los datos introducidos no coinciden con tu perfil o clave.', 'error');
    }
    
    btn.disabled = false;
    btn.textContent = 'CONFIRMAR IDENTIDAD';
}

async function handleLogout() {
    const btn = document.getElementById('logout-button');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'SALIENDO...';
    stopSessionChecker(); 
    await apiLogout(); 
    showMessage('Sesión cerrada correctamente.', 'success');
    navigateTo('login-screen');
    btn.disabled = false;
    btn.textContent = originalText;
}

function handleOpenRegisterModal() {
    const ventanaModal = document.getElementById('register-modal');
    ventanaModal.classList.remove('hidden');
    setTimeout(() => {
        ventanaModal.style.opacity = '1';
    }, 10);
}

function handleCloseRegisterModal() {
    const ventanaModal = document.getElementById('register-modal');
    ventanaModal.style.opacity = '0';
    setTimeout(() => {
        ventanaModal.classList.add('hidden');
    }, 300);
}

function handleForgotPassword() {
    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE_RECOVERY);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d+]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

function handleStaffAccess() {
    document.getElementById('area-selection-modal').classList.remove('hidden');
}

function handleSelectTrainer() {
    window.location.href = '/templates/staff/trainer.html'; 
}

function handleSelectAdmin() {
    window.location.href = '/templates/admin/administration.html'; 
}

function handleCloseAreaSelectionModal() {
    document.getElementById('area-selection-modal').classList.add('hidden');
}

function openActivationModal() {
    const modal = document.getElementById('activation-modal');
    document.getElementById('activation-code').value = '';
    modal.classList.remove('hidden');
    setTimeout(() => modal.style.opacity = '1', 10);
}

function closeActivationModal() {
    const modal = document.getElementById('activation-modal');
    modal.style.opacity = '0';
    setTimeout(() => modal.classList.add('hidden'), 300);
}

async function handleVerifyActivation(e) {
    e.preventDefault();
    const email = document.getElementById('activation-email').value;
    const code = document.getElementById('activation-code').value;
    const btn = document.getElementById('verify-btn');

    btn.disabled = true;
    btn.textContent = 'VERIFICANDO...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/verify-activation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showMessage('¡Cuenta activada! Ingresando al sistema...', 'success');
            closeActivationModal();
            document.getElementById('login-btn').click(); 
        } else {
            showMessage(data.error || 'Código inválido o expirado.', 'error');
        }
    } catch (err) {
        showMessage('Error al verificar el código de activación.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'AUTENTICAR CÓDIGO';
    }
}

window.onload = function() {
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            navigateTo('dashboard-screen');
        }, 100); 
    } else {
        setTimeout(transitionToLogin, SPLASH_DURATION_MS);
    }

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('register-request-link').addEventListener('click', handleOpenRegisterModal); 
    document.getElementById('close-register-modal').addEventListener('click', handleCloseRegisterModal);
    document.getElementById('activation-form').addEventListener('submit', handleVerifyActivation);
    document.getElementById('close-activation-modal').addEventListener('click', closeActivationModal);
    document.getElementById('forgot-password-link').addEventListener('click', handleForgotPassword);
    document.getElementById('staff-access-link').addEventListener('click', handleStaffAccess); 
    document.getElementById('select-trainer-btn').addEventListener('click', handleSelectTrainer);
    document.getElementById('select-admin-btn').addEventListener('click', handleSelectAdmin);
    document.getElementById('modal-close-btn').addEventListener('click', handleCloseAreaSelectionModal);

    const sessionModal = document.getElementById('active-session-modal');
    const form = document.getElementById('force-logout-form');
    const options = document.getElementById('modal-options');
    const loginEmailInput = document.getElementById('login-email');
    
    document.getElementById('modal-cancel-btn').addEventListener('click', () => {
        sessionModal.classList.add('hidden');
        showForceLogoutMessage(''); 
    });
    
    document.getElementById('modal-confirm-btn').addEventListener('click', () => {
        options.classList.add('hidden');
        form.classList.remove('hidden');
        document.getElementById('force-email').value = loginEmailInput.value;
    });
    
    document.getElementById('force-logout-cancel').addEventListener('click', () => {
        sessionModal.classList.add('hidden');
        showForceLogoutMessage('');
        options.classList.remove('hidden');
        form.classList.add('hidden');
    });

    form.addEventListener('submit', handleForceLogout);
    document.getElementById('force-dob').addEventListener('input', (e) => formatDateInput(e.target));
    
    const blockModal = document.getElementById('block-modal');
    document.addEventListener('keydown', function(event) {
        if (blockModal && event.key === "Escape" && !blockModal.classList.contains('hidden')) {
            event.preventDefault(); 
            event.stopPropagation();
        }
    }, true); 
};
