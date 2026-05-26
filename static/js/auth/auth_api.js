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

export async function apiRequestShieldCode(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/request_force_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return { ok: response.ok, data: await response.json() };
}

export async function apiVerifyShieldCode(email, code, deviceId) {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify_force_logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, deviceId })
    });
    return { ok: response.ok, data: await response.json() };
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
