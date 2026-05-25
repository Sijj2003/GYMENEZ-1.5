// static/js/profile.js - GYMENEZ BIOMETRICS COCKPIT

// 🚀 DETECTOR INTELIGENTE DE ENTORNO PERIMETRAL
const isLocalhost = window.location.hostname === '127.0.0.1' || 
                    window.location.hostname === 'localhost' || 
                    window.location.protocol === 'file:';

const API_BASE_URL = isLocalhost ? 'http://127.0.0.1:5000' : 'https://sijj2003.pythonanywhere.com';

/**
 * Función Helper para obtener el Pasaporte Criptográfico (Token JWT)
 */
function getBearerToken() {
    const token = localStorage.getItem('gymen_auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Sistema de Notificaciones Flotantes Premium de GYMENEZ
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
 * Sistema de Seguridad UI: Velo Esmerilado Inteligente (Product-Led Growth)
 */
function lockDataCard(cardId, requiredLevel) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    // 1. Ofuscar valores visibles para generar el efecto "Teasing"
    const values = card.querySelectorAll('.value, p.text-gray-300');
    values.forEach(v => v.textContent = '***'); 

    // Guardas de control para evitar duplicar overlays en el DOM
    if (card.querySelector('.lock-overlay')) return;

    // 2. Crear velo esmerilado de alta gama coherente con Tailwind
    const overlay = document.createElement('div');
    overlay.className = 'lock-overlay absolute inset-0 z-20 bg-[#030305]/75 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer rounded-[24px] md:rounded-[32px] transition-all duration-300 hover:bg-[#030305]/60';
    overlay.innerHTML = `
        <div class="bg-[#111] border border-white/10 px-4 md:px-5 py-2 md:py-2.5 rounded-xl uppercase tracking-widest text-[9px] md:text-[10px] font-black text-gray-300 shadow-2xl flex items-center gap-2 hover:border-[#FFC300]/50 transition-colors">
            <span>🔒</span> REQUIERE PLAN ${requiredLevel}
        </div>
    `;
    
    overlay.onclick = (e) => {
        e.stopPropagation();
        showMessage(`MÓDULO RESTRINGIDO: El mapeo antropométrico avanzado requiere Plan ${requiredLevel}. Mejora tu suscripción.`, 'error');
        // Redirección suave al catálogo de facturación tras 1.5 segundos
        setTimeout(() => {
            window.location.href = '/billing/planes.html';
        }, 1500);
    };
    
    card.appendChild(overlay);
}

/**
 * Fetch a la API: Ficha de Identidad Base (Agnóstica y Libre)
 */
async function apiFetchProfileData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile/me`, { headers: getBearerToken() }); 
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Fetch a la API: Telemetría Antropométrica (Parcializada en el Servidor)
 */
async function apiFetchMetrics() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/metrics/me`, { headers: getBearerToken() });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Renderizado Dinámico: Tarjeta de Identidad (Siempre Visible)
 */
function renderProfile(data) {
    document.getElementById('p-fullname').textContent = `${data.name || ''} ${data.last_name || ''}`.trim() || 'ATLETA';
    document.getElementById('p-email').textContent = data.email || '--';
    document.getElementById('p-subscription').textContent = data.subscription_level ? `PLAN ${data.subscription_level}` : 'PLAN BÁSICO';
    
    // Parseo inteligente de fechas contra colisiones de formato de Firestore
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

/**
 * Renderizado Dinámico: Fichas Corporales y Médicas
 */
function renderMetrics(m) {
    // Las 3 métricas de control rápido básico siempre se renderizan (vienen del servidor para planes básicos)
    document.getElementById('m-peso').textContent = m.peso ? m.peso : '--';
    document.getElementById('m-estatura').textContent = m.estatura ? m.estatura : '--';
    document.getElementById('m-edad').textContent = m.edad ? m.edad : '--';
    
    // Si vienen campos avanzados (Planes Standard o superiores), se mapean con normalidad
    if (document.getElementById('m-cuello')) document.getElementById('m-cuello').textContent = m.cuello ? `${m.cuello} cm` : '--';
    if (document.getElementById('m-espalda')) document.getElementById('m-espalda').textContent = m.espalda ? `${m.espalda} cm` : '--';
    if (document.getElementById('m-torax')) document.getElementById('m-torax').textContent = m.torax ? `${m.torax} cm` : '--';
    if (document.getElementById('m-abdomen')) document.getElementById('m-abdomen').textContent = m.abdomen ? `${m.abdomen} cm` : '--';
    if (document.getElementById('m-brazo_der')) document.getElementById('m-brazo_der').textContent = m.brazo_derecho || '--';
    if (document.getElementById('m-brazo_izq')) document.getElementById('m-brazo_izq').textContent = m.brazo_izquierdo || '--';
    if (document.getElementById('m-antebrazo_der')) document.getElementById('m-antebrazo_der').textContent = m.antebrazo_derecho || '--';
    if (document.getElementById('m-antebrazo_izq')) document.getElementById('m-antebrazo_izq').textContent = m.antebrazo_izquierdo || '--';
    if (document.getElementById('m-cintura')) document.getElementById('m-cintura').textContent = m.cintura ? `${m.cintura} cm` : '--';
    if (document.getElementById('m-femur_der')) document.getElementById('m-femur_der').textContent = m.femur_derecho || '--';
    if (document.getElementById('m-femur_izq')) document.getElementById('m-femur_izq').textContent = m.femur_izquierdo || '--';
    if (document.getElementById('m-tibia_der')) document.getElementById('m-tibia_der').textContent = m.tibia_derecha || '--';
    if (document.getElementById('m-tibia_izq')) document.getElementById('m-tibia_izq').textContent = m.tibia_izquierda || '--';
    if (document.getElementById('m-alergias')) document.getElementById('m-alergias').textContent = m.alergias || 'Ninguna registrada.';
    if (document.getElementById('m-enfermedades')) document.getElementById('m-enfermedades').textContent = m.enfermedades_cronicas || 'Ninguna registrada.';
    if (document.getElementById('m-otros')) document.getElementById('m-otros').textContent = m.otros || 'Sin observaciones.';
}

/**
 * Orquestador Principal de Inicialización
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

        if (profileRes.success && profileRes.profile) {
            renderProfile(profileRes.profile);
        }

        if (metricsRes.success && metricsRes.metrics) {
            renderMetrics(metricsRes.metrics);
            
            // 🔥 CONTROLADOR SINTIENTE DE CONVERSIÓN PLG:
            // Interceptamos la bandera inmutable del servidor para inyectar los candados
            if (metricsRes.metrics.is_restricted_tier) {
                setTimeout(() => {
                    lockDataCard('card-upper-body', 'STANDARD');
                    lockDataCard('card-lower-body', 'STANDARD');
                    lockDataCard('card-medical', 'STANDARD');
                }, 150); // Pequeño delay táctico para asegurar la carga completa de la UI
            }
        }

        // Apagar spinners de carga y revelar cockpit biográfico
        const spinner = document.getElementById('loading-spinner');
        const content = document.getElementById('profile-content');
        if (spinner) spinner.classList.add('hidden');
        if (content) content.classList.remove('hidden');

    } catch (error) {
        console.error("Error fatal en el ciclo de renderizado perimetral:", error);
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.innerHTML = '<p class="text-red-400 font-bold uppercase tracking-widest text-xs">❌ Error al sincronizar con el Núcleo GYMENEZ.</p>';
        }
    }
}

window.addEventListener('DOMContentLoaded', loadProfileData);
