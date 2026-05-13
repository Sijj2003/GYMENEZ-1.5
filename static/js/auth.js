// --- CONFIGURACIÓN DE SEGURIDAD Y SESIÓN ---
const DEVICE_ID_KEY = 'gymen_device_id';
let localDeviceId = localStorage.getItem(DEVICE_ID_KEY);

if (!localDeviceId) {
    localDeviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, localDeviceId);
}

// 🚀 URL BASE DE TU API. SIN LA BARRA FINAL (/)
const API_BASE_URL = 'https://sijj2003.pythonanywhere.com'; 

let CURRENT_USER_SESSION = null; 
let sessionCheckerInterval = null; 
let isFirstCheckIgnored = false; 

// --- CONSTANTES PARA WHATSAPP ---
const WHATSAPP_NUMBER = '+584148780392';
const WHATSAPP_MESSAGE_RECOVERY = 'Hola quisiera solicitar la recuperacion de usuario/contraseña';

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

        // Si el usuario está bloqueado o hay otra sesión (Error 403)
        if (response.status === 403) {
             return { success: false, error: data.error || 'Acceso denegado (403).' };
        }
        
        // 🚩 AJUSTE AQUÍ: Manejo de errores y activación requerida 🚩
        if (!response.ok || !data.success) {
            // Si el backend dice que falta activar la cuenta:
            if (data.requires_activation) {
                return { 
                    success: false, 
                    requires_activation: true, 
                    email: data.email, 
                    message: data.message 
                };
            }
            // Error genérico de credenciales
            return { success: false, error: data.error || 'Error de conexión con la API o credenciales inválidas.' };
        }

        // Si todo sale bien (Success)
        CURRENT_USER_SESSION = data.user;
        localStorage.setItem('userSession', JSON.stringify(data.user)); 
        return { success: true, user: data.user };

    } catch (e) {
        console.error("Error en la conexión fetch:", e);
        return { success: false, error: 'No se pudo conectar con el servidor API REST. Verifica la URL o la política CORS.' };
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

// --- Variables y Utilidades Globales ---
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
        messagebox.removeAttribute('style'); // ¡CORRECCIÓN AQUÍ!
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
    modal.querySelector('.glass-card').style.transform = 'scale(1)';

    setTimeout(() => {
        modal.style.opacity = '0';
        modal.querySelector('.glass-card').style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 500); 
    }, durationMs);
}

function showForceLogoutMessage(message, type = 'error') {
    const msgBox = document.getElementById('force-logout-message');
    if (message) {
        msgBox.textContent = message;
        msgBox.className = `p-3 mb-4 rounded-lg font-semibold text-center ${type === 'error' ? 'bg-red-800/70 text-red-100' : 'bg-green-800/70 text-green-100'}`;
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
            body.classList.add('dashboard-background');
            const storedSession = localStorage.getItem('userSession');
            if (storedSession) {
                CURRENT_USER_SESSION = JSON.parse(storedSession);
            }

            if (CURRENT_USER_SESSION) {
                loadDashboardData(); 
                startSessionChecker(); 
            }
        } else {
            body.classList.remove('dashboard-background');
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

async function apiForceLogout(email, password, deviceId, name, dob, phone, ci) {
    console.log(`API: Llamada a ${API_BASE_URL}/api/force_logout para forzar el cierre de sesión de ${email}. Device ID: ${deviceId}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/force_logout`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, deviceId, name, dob, phone, ci })
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
        return { success: false, error: 'No se pudo conectar con el servidor API REST para forzar el cierre.' };
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
    btn.textContent = 'VERIFICANDO SESIÓN...';

    const response = await apiLogin(email, password, localDeviceId);
    
    if (!response.success) {
        btn.disabled = false;
        btn.textContent = 'INGRESAR';

        // 🚩 NUEVA LÓGICA: Si el usuario necesita activación por código 🚩
        if (response.requires_activation) {
            // Guardamos el email en el campo oculto del modal de activación
            document.getElementById('activation-email').value = response.email || email;
            
            // Abrimos el modal de ingreso de código
            openActivationModal();
            
            // Mostramos un mensaje informativo (en verde para indicar que el login fue correcto pero falta un paso)
            showMessage('Revisa tu correo para el código de seguridad.', 'success');
            return;
        }
        
        // --- Manejo de errores existentes ---
        if (response.error && response.error.includes('bloqueada')) {
            blockModal.classList.remove('hidden'); 
            showMessage('Acceso Restringido.', 'error');
            
            setTimeout(() => {
                blockModal.classList.add('hidden');
            }, 10000); 
        
        } else if (response.error && response.error.includes('Ya hay una sesión activa')) {
            sessionModal.classList.remove('hidden');
            showMessage('Sesión activa detectada.', 'error');
            
            document.getElementById('force-logout-form').classList.add('hidden');
            document.getElementById('modal-options').classList.remove('hidden');
            showForceLogoutMessage(''); 

        } else {
            showMessage(response.error, 'error');
        }
        
        return;
    } 
    
    // Si el login es exitoso y el usuario ya está activo
    showMessage('¡Inicio de sesión exitoso!', 'success');
    navigateTo('dashboard-screen');
    sessionModal.classList.add('hidden'); 
    
    btn.disabled = false;
    btn.textContent = 'INGRESAR';
}

async function handleRegister(e) {
    e.preventDefault();
    
    // 1. Selección del botón y feedback visual
    const btn = e.target.querySelector('button[type="submit"]') || document.getElementById('reg-submit-btn');
    const originalText = btn ? btn.textContent : 'Crear Cuenta';

    // --- CONSTRUCCIÓN DE VALORES COMPUESTOS ---
    const ciType = document.getElementById('reg-ci-type').value;
    const ciNumber = document.getElementById('reg-ci').value.trim();
    const fullCI = `${ciType}-${ciNumber}`; // Ejemplo: V-20.123.456

    const phonePrefix = document.getElementById('reg-phone-prefix').value;
    const phoneNum = document.getElementById('reg-phone-num').value.trim();
    const fullPhone = `${phonePrefix}-${phoneNum}`; // Ejemplo: 0414-3543922

    // 2. Recolección de datos (Usando las variables compuestas)
    const data = {
        // Datos de cuenta
        email: document.getElementById('reg-email').value.trim().toLowerCase(),
        password: document.getElementById('reg-password').value,
        
        // Datos personales para la colección 'profiles'
        name: document.getElementById('reg-name').value.trim(),
        last_name: document.getElementById('reg-lastname').value.trim(),
        id_number: fullCI,        // Enviado como V-00.000.000
        phone_number: fullPhone,  // Enviado como 04XX-0000000
        dob: document.getElementById('reg-dob').value.trim(), // Formato DD/MM/YYYY
        sex: document.getElementById('reg-sex').value
    };

    // 3. Estado de carga
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'PROCESANDO PERFIL...';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // --- MANEJO DE BLOQUEO POR LÍMITE (ERROR 429) ---
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

        // --- MANEJO DE RESPUESTAS ---
        const res = await response.json();
        
        if (response.ok && res.success) {
            // Éxito: El perfil ya está lleno en la base de datos
            showMessage('¡Perfil creado! Revisa tu correo e inicia sesión para activar tu cuenta.', 'success');
            
            if (typeof handleCloseRegisterModal === 'function') {
                handleCloseRegisterModal();
            }
            e.target.reset(); // Limpia el formulario
        } else {
            // Error: Ejemplo "El correo ya existe" o "Datos incompletos"
            showMessage(res.error || 'No se pudo completar el perfil.', 'error');
        }

    } catch (err) {
        console.error('Error en registro:', err);
        showMessage('Error de conexión. Inténtalo más tarde.', 'error');
    } finally {
        // 4. Restaurar estado del botón
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

    const response = await apiForceLogout(email, password, localDeviceId, name, dob, phone, ci);

    if (response.success) {
        const delayMs = 7000;
                
        modal.classList.add('hidden');
        
        const successMessage = `Proceso completado. La sesión anterior ha sido cerrada exitosamente. Por favor, inicie sesión nuevamente para acceder.`;
        showCenteredMessage(successMessage, delayMs); 

        localStorage.removeItem('userSession');
        CURRENT_USER_SESSION = null; 
        
        setTimeout(() => {
            navigateTo('login-screen');
            document.getElementById('login-password').value = '';
            
        }, delayMs); 

    } else {
        showForceLogoutMessage('Verificación fallida: Los datos introducidos son incorrectos o la contraseña es inválida.', 'error');
    }
    
    btn.disabled = false;
    btn.textContent = 'Cerrar Sesión Activa';
}

async function handleLogout() {
    const btn = document.getElementById('logout-button');
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = 'Cerrando...';
    
    stopSessionChecker(); 

    await apiLogout(); 
    
    showMessage('Sesión cerrada correctamente.', 'success');
    navigateTo('login-screen');

    btn.disabled = false;
    btn.textContent = originalText;
}

// --- FUNCIONES DEL NUEVO MODAL DE REGISTRO ---
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
    window.location.href = 'trainer.html'; 
}

function handleSelectAdmin() {
    window.location.href = 'administration.html'; 
}

function handleCloseAreaSelectionModal() {
    document.getElementById('area-selection-modal').classList.add('hidden');
}

// --- FUNCIONES DEL MODAL DE ACTIVACIÓN ---
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
            
            // Como ya se activó, simulamos un click en "INGRESAR" para que inicie sesión de una vez
            document.getElementById('login-btn').click(); 
            
        } else {
            showMessage(data.error || 'Código inválido o expirado.', 'error');
        }
    } catch (err) {
        showMessage('Error al verificar el código de activación.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'VERIFICAR';
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
    
    // --- NUEVO: AHORA ABRE EL MODAL EN VEZ DE WHATSAPP ---
    document.getElementById('register-request-link').addEventListener('click', handleOpenRegisterModal); 
    document.getElementById('close-register-modal').addEventListener('click', handleCloseRegisterModal);
    // -----------------------------------------------------

    // --- LISTENERS DEL MODAL DE ACTIVACIÓN ---
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

// --- Formateo Automático de Fecha (DD/MM/YYYY) ---
const dobInput = document.getElementById('reg-dob');
if (dobInput) {
    dobInput.addEventListener('input', function(e) {
        let v = e.target.value.replace(/\D/g, ''); 
        if (v.length > 8) v = v.slice(0, 8);
        let final = "";
        if (v.length > 0) final += v.slice(0, 2);
        if (v.length > 2) final += '/' + v.slice(2, 4);
        if (v.length > 4) final += '/' + v.slice(4, 8);
        e.target.value = final;
    });
}

// --- Formateo Automático de Cédula (00.000.000) ---
const ciInput = document.getElementById('reg-ci');
if (ciInput) {
    ciInput.addEventListener('input', function(e) {
        let v = e.target.value.replace(/\D/g, ''); 
        if (v.length > 8) v = v.slice(0, 8);
        let formatted = "";
        if (v.length > 0) {
            if (v.length <= 2) formatted = v;
            else if (v.length <= 5) formatted = v.slice(0, v.length - 3) + '.' + v.slice(v.length - 3);
            else formatted = v.slice(0, v.length - 6) + '.' + v.slice(v.length - 6, v.length - 3) + '.' + v.slice(v.length - 3);
        }
        e.target.value = formatted;
    });
}

// --- Bloqueo de letras en Teléfono ---
const phoneInput = document.getElementById('reg-phone-num');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 7);
    });
}
