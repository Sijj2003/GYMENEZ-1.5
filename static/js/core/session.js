// static/js/core/session.js
import { API_BASE_URL, getAuthHeaders } from './api.js';

export const DEVICE_ID_KEY = 'gymen_device_id';
export const AUTH_TOKEN_KEY = 'gymen_auth_token';

// Generar o recuperar Device ID único
export let localDeviceId = localStorage.getItem(DEVICE_ID_KEY);
if (!localDeviceId) {
    localDeviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, localDeviceId);
}

export let CURRENT_USER_SESSION = null;

// =======================================================
// 🚪 FUNCIÓN GLOBAL DE EXPULSIÓN PROFESIONAL
// =======================================================
export function forceGlobalLogout(reason) {
    CURRENT_USER_SESSION = null;
    localStorage.removeItem('userSession');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('gymen_session_exp'); 
    alert(reason || "Tu sesión ha expirado por seguridad. Vuelve a ingresar.");
    window.location.href = '/apps/start/login.html';
}

// =======================================================
// --- VIGILANTE INTELIGENTE Y UNIVERSAL DE SESIÓN ---
// =======================================================
export function isTokenExpiredLocally() {
    const exp = localStorage.getItem('gymen_session_exp');
    if (!exp) return true;
    return Date.now() >= parseInt(exp);
}

export async function checkSessionGlobal() {
    const userSessionRaw = localStorage.getItem('userSession');
    const exp = localStorage.getItem('gymen_session_exp');

    if (!userSessionRaw || !exp) return;

    try {
        const user = JSON.parse(userSessionRaw);
        const userId = user.id || user._id;

        const response = await fetch(`${API_BASE_URL}/api/verify_session`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId: userId, deviceId: localDeviceId })
        });

        const data = await response.json();

        // Si el servidor bloqueó la cuenta, o alguien robó la sesión, lo echamos
        if (response.status === 403 || !data.success) {
            forceGlobalLogout(data.error || data.message || 'Tu sesión fue cerrada por seguridad.');
        }
    } catch (e) {
        console.error("Vigilante falló al contactar al servidor.");
    }
}

export function startSmartSessionWatcher() {
    if (!localStorage.getItem('userSession') || !localStorage.getItem('gymen_session_exp')) return;

    // Verificación inmediata
    if (isTokenExpiredLocally()) {
        forceGlobalLogout('Tu sesión expiró. Por favor, ingresa nuevamente.');
        return;
    }

    // Vigilar en segundo plano cada minuto
    setInterval(() => {
        if (isTokenExpiredLocally()) {
            forceGlobalLogout('Tu tiempo de sesión ha terminado. Por favor, ingresa nuevamente.');
        }
    }, 60000);

    // Cuando el usuario cambia de pestaña y regresa, re-verificamos con el servidor
    document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === 'visible') {
            if (isTokenExpiredLocally()) {
                forceGlobalLogout('Tu sesión expiró mientras estabas inactivo.');
            } else {
                await checkSessionGlobal();
            }
        }
    });
}
