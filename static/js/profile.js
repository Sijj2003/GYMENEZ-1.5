// static/js/profile.js

// 🚀 DETECTOR INTELIGENTE DE ENTORNO PERIMETRAL
const isLocalhost = window.location.hostname === '127.0.0.1' || 
                    window.location.hostname === 'localhost' || 
                    window.location.protocol === 'file:';

const API_BASE_URL = isLocalhost ? 'http://127.0.0.1:5000' : 'https://sijj2003.pythonanywhere.com';

/**
 * Función Helper para obtener el Pasaporte Criptográfico (Token)
 */
function getBearerToken() {
    const token = localStorage.getItem('gymen_auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Sistema de Notificaciones Elegante
 */
function showMessage(message, type = 'error') {
    const messagebox = document.getElementById('message-box');
    if(!messagebox) return;
    messagebox.textContent = message;
    messagebox.className = `fixed top-6 left-1/2 transform -translate-x-1/2 px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase shadow-2xl z-[9999] transition-all duration-500 text-center w-11/12 max-w-[350px] border border-white/10 ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`;
    
    messagebox.style.opacity = '1';
    messagebox.style.transform = 'translate(-50%, 0)';
    
    setTimeout(() => {
        messagebox.style.opacity = '0';
        messagebox.style.transform = 'translate(-50%, -20px)';
    }, 3500);
}

/**
 * Sistema de Seguridad UI: Bloqueo de Tarjetas (Candados)
 */
function lockDataCard(cardId, requiredLevel) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    // Ofuscar valores visibles
    const values = card.querySelectorAll('.value, p.text-gray-300');
    values.forEach(v => v.textContent = '***'); 

    // Crear velo esmerilado
    const overlay = document.createElement('div');
    overlay.className = 'lock-overlay absolute inset-0 z-20 bg-[#030305]/60 flex flex-col items-center justify-center cursor-not-allowed rounded-[24px] md:rounded-[32px]';
    overlay.innerHTML = `
        <div class="bg-[#111] border border-white/10 px-4 md:px-5 py-2 md:py-2.5 rounded-xl uppercase tracking-widest text-[9px] md:text-[10px] font-black text-gray-300 shadow-2xl flex items-center gap-2 hover:border-[#FFC300]/50 transition-colors">
            <span>🔒</span> REQUIERE PLAN ${requiredLevel}
        </div>
    `;
    
    overlay.onclick = (e) => {
        e.stopPropagation();
        showMessage(`ACCESO RESTRINGIDO: El registro avanzado requiere Plan ${requiredLevel}. Mejora tu suscripción.`, 'error');
    };
    
    card.appendChild(overlay);
}

function applyProfileLocks(level) {
    const normalizedLevel = (level || 'No Suscrito').toUpperCase();
    const isUltra = normalizedLevel === 'ULTRA';
    const isPlus = normalizedLevel === 'PLUS' || isUltra;

    // Si NO es Plus ni Ultra, bloqueamos las métricas
    if (!isPlus) {
        setTimeout(() => {
            lockDataCard('card-upper-body', 'PLUS');
            lockDataCard('card-lower-body', 'PLUS');
            lockDataCard('card-medical', 'PLUS');
        }, 300); // Retardo sutil para asegurar que el DOM cargó
    }
}

/**
 * Fetch a la API
 */
async function apiFetchProfileData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile/me`, { headers: getBearerToken() }); 
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        return { success: true, profile: data.profile };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function apiFetchMetrics() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/metrics/me`, { headers: getBearerToken() });
        if (response.status === 403) return { success: false, isForbidden: true, message: 'Módulo restringido por plan.' };
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Renderizado de Datos
 */
function renderProfile(data) {
    document.getElementById('p-fullname').textContent = `${data.name || ''} ${data.last_name || ''}`.trim() || 'ATLETA';
    document.getElementById('p-email').textContent = data.email || '--';
    document.getElementById('p-subscription').textContent = data.subscription_level ? `PLAN ${data.subscription_level}` : 'PLAN BASE';
    
    // Parseo inteligente de fechas por si vienen de Firestore en otro formato
    let dobText = data.dob || '--';
    if (dobText.includes('-')) {
        const parts = dobText.split('-');
        if (parts.length === 3) dobText = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    document.getElementById('p-dob').textContent = dobText;
    
    document.getElementById('p-sex').textContent = data.sex || '--';
    
    let activeSinceText = data.activo_desde || '--';
    if (activeSinceText.includes('-')) {
        const parts = activeSinceText.split('-');
        if (parts.length === 3) activeSinceText = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    document.getElementById('p-active-since').textContent = activeSinceText;
}

function renderMetrics(m) {
    document.getElementById('m-peso').textContent = m.peso ? m.peso : '--';
    document.getElementById('m-estatura').textContent = m.estatura ? m.estatura : '--';
    document.getElementById('m-edad').textContent = m.edad ? m.edad : '--';
    document.getElementById('m-cuello').textContent = m.cuello ? `${m.cuello} cm` : '--';
    document.getElementById('m-espalda').textContent = m.espalda ? `${m.espalda} cm` : '--';
    document.getElementById('m-torax').textContent = m.torax ? `${m.torax} cm` : '--';
    document.getElementById('m-abdomen').textContent = m.abdomen ? `${m.abdomen} cm` : '--';
    document.getElementById('m-brazo_der').textContent = m.brazo_derecho || '--';
    document.getElementById('m-brazo_izq').textContent = m.brazo_izquierdo || '--';
    document.getElementById('m-antebrazo_der').textContent = m.antebrazo_derecho || '--';
    document.getElementById('m-antebrazo_izq').textContent = m.antebrazo_izquierdo || '--';
    document.getElementById('m-cintura').textContent = m.cintura ? `${m.cintura} cm` : '--';
    document.getElementById('m-femur_der').textContent = m.femur_derecho || '--';
    document.getElementById('m-femur_izq').textContent = m.femur_izquierdo || '--';
    document.getElementById('m-tibia_der').textContent = m.tibia_derecha || '--';
    document.getElementById('m-tibia_izq').textContent = m.tibia_izquierda || '--';
    document.getElementById('m-alergias').textContent = m.alergias || 'Ninguna registrada.';
    document.getElementById('m-enfermedades').textContent = m.enfermedades_cronicas || 'Ninguna registrada.';
    document.getElementById('m-otros').textContent = m.otros || 'Sin observaciones.';
}

/**
 * Función Principal
 */
async function loadProfileData() {
    const storedSession = localStorage.getItem('userSession');
    const token = localStorage.getItem('gymen_auth_token');
    
    if (!storedSession || !token) {
        window.location.href = '/apps/start/login.html';
        return;
    }
    
    try {
        const [profileRes, metricsRes] = await Promise.all([
            apiFetchProfileData(),
            apiFetchMetrics()
        ]);

        if (profileRes.success) {
            renderProfile(profileRes.profile);
            // 🔥 APLICAR CANDADOS CON LA DATA QUE YA OBTUVIMOS
            applyProfileLocks(profileRes.profile.subscription_level);
        } else {
            applyProfileLocks('No Suscrito');
        }

        if (metricsRes.success && metricsRes.metrics && !metricsRes.isForbidden) {
            renderMetrics(metricsRes.metrics);
        }

        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('profile-content').classList.remove('hidden');

    } catch (error) {
        console.error("Error fatal en la carga de perfil:", error);
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.innerHTML = '<p class="text-red-400 font-bold uppercase tracking-widest">❌ Error al conectar con el servidor.</p>';
        }
    }
}

window.addEventListener('DOMContentLoaded', loadProfileData);
