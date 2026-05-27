// static/js/auth/auth_main.js

import { setupFetchInterceptor } from '../core/api.js';
import { localDeviceId, AUTH_TOKEN_KEY, startSmartSessionWatcher, forceGlobalLogout } from '../core/session.js';
import { showMessage, openModalSafe, closeModalSafe } from '../utils/ui.js';
import { applyDateMask, applyCIMask, applyPhoneMask } from '../utils/masks.js';
import { apiLogin, apiRegister, apiVerifyOTP, apiLogout } from './auth_api.js';

// Inicializar interceptor de red global
setupFetchInterceptor();

// ==========================================
// CONTROLADORES DE EVENTOS
// ==========================================

async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    btn.disabled = true;
    btn.textContent = 'VERIFICANDO...';

    const response = await apiLogin(email, password, localDeviceId);
    
    if (!response.success) {
        btn.disabled = false;
        btn.textContent = 'INGRESAR AL PORTAL';

        if (response.requires_activation) {
            document.getElementById('activation-email').value = response.email || email;
            openModalSafe('activation-modal');
            showMessage('Revisa tu correo para el código de seguridad.', 'success');
            return;
        }
        
        // 🛡️ ESCÁNER INTELIGENTE REFORZADO (Caso-Insensible y Tolerante a Keywords del Backend)
        const errorText = (response.error || '').toLowerCase();
        const isSessionActive = response.is_session_active || 
                                errorText.includes('sesión activa') || 
                                errorText.includes('sesion activa') || 
                                errorText.includes('activa') || 
                                errorText.includes('dispositivo') ||
                                errorText.includes('abierta') ||
                                errorText.includes('duplicada');

        if (isSessionActive) {
            openModalSafe('active-session-modal');
            
            const modalOptions = document.getElementById('modal-options');
            const forceLogoutForm = document.getElementById('force-logout-form');
            const forceEmailInput = document.getElementById('force-email');
            const forceLogoutMsg = document.getElementById('force-logout-msg');

            if (modalOptions) modalOptions.classList.remove('hidden');
            if (forceLogoutForm) forceLogoutForm.classList.add('hidden');
            if (forceEmailInput) forceEmailInput.value = email;
            if (forceLogoutMsg && response.error) {
                forceLogoutMsg.textContent = response.error;
            }
            return;
        }
        
        if (errorText.includes('bloqueada') || errorText.includes('suspendida') || errorText.includes('intentos')) {
            openModalSafe('block-modal');
            setTimeout(() => closeModalSafe('block-modal'), 10000); 
        } else {
            showMessage(response.error || 'Credenciales incorrectas.', 'error');
        }
        return;
    } 
    
    // Login exitoso: Guardar sesión e ir al dashboard
    localStorage.setItem('userSession', JSON.stringify(response.user)); 
    if (response.token) localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    localStorage.setItem('gymen_session_exp', Date.now() + (480 * 60 * 1000));
    
    window.location.href = '/apps/start/inicio.html';
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const btn = document.querySelector('#step-section-3 .btn-gold');
    const originalText = btn ? btn.textContent : 'Activar Perfil';

    const rawName = document.getElementById('reg-name').value.trim();
    const rawLastName = document.getElementById('reg-lastname').value.trim();
    const ciType = document.getElementById('reg-ci-type') ? document.getElementById('reg-ci-type').value : 'V';
    const ciNumber = document.getElementById('reg-ci') ? document.getElementById('reg-ci').value.trim() : `TEMP-${Date.now()}`;
    const phonePrefix = document.getElementById('reg-phone-prefix').value;
    const phoneNum = document.getElementById('reg-phone-num').value.trim();
    const password = document.getElementById('reg-password').value;

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(rawName) || !nameRegex.test(rawLastName)) return showMessage('Nombres solo pueden contener letras.', 'error');
    if(password.length < 6 || password.length > 15) return showMessage('La contraseña debe tener entre 6 y 15 caracteres.', 'error');

    const cleanCiNumber = ciNumber.replace(/\D/g, ''); 
    const cleanPhoneNum = phoneNum.replace(/\D/g, '');

    const data = {
        email: document.getElementById('reg-email').value.trim().toLowerCase(),
        password: password,
        name: rawName.replace(/</g, "&lt;").replace(/>/g, "&gt;"), 
        last_name: rawLastName.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
        id_number: `${ciType}-${cleanCiNumber}`,        
        phone_number: `${phonePrefix}-${cleanPhoneNum}`,  
        dob: document.getElementById('reg-dob').value.trim(), 
        sex: document.getElementById('reg-sex').value
    };

    if (btn) { btn.disabled = true; btn.textContent = 'PROCESANDO...'; }

    const res = await apiRegister(data);
    if (res.success) {
        if (typeof window.triggerCinematicSetup === 'function') {
            window.triggerCinematicSetup(data.name.toUpperCase());
        } else {
            showMessage('¡Perfil creado! Inicia sesión.', 'success');
            setTimeout(() => window.location.href = 'login.html', 2000);
        }
    } else {
        showMessage(res.error, 'error');
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
}

// ==========================================
// INICIALIZACIÓN DEL DOM
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    startSmartSessionWatcher();

    const isLoginScreen = document.getElementById('login-screen') !== null;
    if (isLoginScreen && localStorage.getItem('userSession')) {
        window.location.href = '/apps/start/inicio.html';
        return;
    }

    document.getElementById('login-form')?.addEventListener('submit', handleLoginSubmit);
    
    const regForm = document.getElementById('multi-step-form');
    if (regForm) {
        regForm.addEventListener('submit', (e) => e.preventDefault());
    }

    const regBtn = document.getElementById('reg-submit-btn');
    if (regBtn) {
        regBtn.addEventListener('click', handleRegisterSubmit);
    }

    document.getElementById('reg-dob')?.addEventListener('input', applyDateMask);
    document.getElementById('reg-ci')?.addEventListener('input', applyCIMask);
    document.getElementById('reg-phone-num')?.addEventListener('input', applyPhoneMask);

    document.getElementById('logout-button')?.addEventListener('click', async (e) => {
        e.target.disabled = true;
        const user = JSON.parse(localStorage.getItem('userSession') || '{}');
        const userId = user.id || user._id;
        await apiLogout(userId, localDeviceId);
        forceGlobalLogout("Sesión cerrada correctamente.");
    });
});
