// static/js/auth/auth_api.js
import { API_BASE_URL, getAuthHeaders } from '../core/api.js';

export async function apiLogin(email, password, deviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, deviceId })
        });
        if (response.status === 429) return { success: false, error: 'Múltiples intentos. Espera 60 segundos.' };
        const data = await response.json();
        if (response.status === 403) return { success: false, error: data.error || 'Acceso denegado.' };
        if (data.is_session_active) return { success: false, is_session_active: true, email: data.email, error: data.error };
        return { success: response.ok && data.success, ...data };
    } catch (e) {
        return { success: false, error: 'Error de conexión con el servidor.' };
    }
}

export async function apiRegister(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (response.status === 429) return { success: false, error: 'Límite de registros alcanzado. Intenta más tarde.' };
        return await response.json();
    } catch (e) {
        return { success: false, error: 'Error de red al intentar registrar.' };
    }
}

export async function apiVerifyOTP(email, code) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify-activation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        return await response.json();
    } catch (e) {
        return { success: false, error: 'Error al verificar el código.' };
    }
}

// ==========================================
// 🛡️ REFORZADO: SOLICITAR CÓDIGO DE ESCUDO
// ==========================================
export async function apiRequestShieldCode(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/request_force_code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return { ok: response.ok, data };
        } else {
            // Si el servidor responde con HTML (Error 404 o 500), evitamos el crash
            console.error(`🚨 Servidor respondió con código ${response.status} sin formato JSON.`);
            return { ok: false, data: { error: `Error de ruta o servidor (${response.status}).` } };
        }
    } catch (e) {
        console.error("Fallo de red crítico:", e);
        return { ok: false, data: { error: "No hay conexión con el servidor perimetral." } };
    }
}

// ==========================================
// 🛡️ REFORZADO: VERIFICAR CÓDIGO DE ESCUDO
// ==========================================
export async function apiVerifyShieldCode(email, code, deviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify_force_logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, deviceId })
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return { ok: response.ok, data };
        } else {
            console.error(`🚨 Servidor respondió con código ${response.status} sin formato JSON.`);
            return { ok: false, data: { error: `Fallo en verificación (${response.status}).` } };
        }
    } catch (e) {
        console.error("Fallo de red crítico:", e);
        return { ok: false, data: { error: "No hay conexión con el servidor perimetral." } };
    }
}

export async function apiLogout(userId, deviceId) {
    try {
        await fetch(`${API_BASE_URL}/api/logout`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId, deviceId })
        });
    } catch (e) {
        console.error("Error al cerrar sesión", e);
    }
}
