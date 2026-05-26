import { API_BASE_URL, getAuthHeaders } from '../core/api.js';
import { showMessage } from '../utils/ui.js';

// ==========================================
// 🛡️ SISTEMA DE SEGURIDAD UI (PRODUCT-LED GROWTH)
// ==========================================
function lockDataCard(cardId, requiredLevel) {
    const card = document.getElementById(cardId);
    if (!card || card.querySelector('.lock-overlay')) return;
    
    card.querySelectorAll('.value, p.text-gray-300').forEach(v => v.textContent = '***'); 

    const overlay = document.createElement('div');
    overlay.className = 'lock-overlay absolute inset-0 z-20 bg-[#030305]/75 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer rounded-[24px] md:rounded-[32px] transition-all duration-300 hover:bg-[#030305]/60';
    overlay.innerHTML = `
        <div class="bg-[#111] border border-white/10 px-4 py-2.5 rounded-xl uppercase tracking-widest text-[10px] font-black text-gray-300 shadow-2xl flex items-center gap-2 hover:border-[#FFC300]/50 transition-colors">
            <span>🔒</span> REQUIERE PLAN ${requiredLevel}
        </div>
    `;
    
    overlay.onclick = (e) => {
        e.stopPropagation();
        showMessage(`MÓDULO RESTRINGIDO: Requiere Plan ${requiredLevel}. Mejora tu suscripción.`, 'error');
        setTimeout(() => window.location.href = '/billing/planes.html', 1500);
    };
    
    card.appendChild(overlay);
}

// ==========================================
// 📊 RENDERIZADO DE DATOS
// ==========================================
function renderProfile(data) {
    document.getElementById('p-fullname').textContent = `${data.name || ''} ${data.last_name || ''}`.trim() || 'ATLETA';
    document.getElementById('p-email').textContent = data.email || '--';
    document.getElementById('p-subscription').textContent = data.subscription_level ? `PLAN ${data.subscription_level}` : 'PLAN BÁSICO';
    
    let dobText = data.dob || '--';
    if (dobText.includes('-')) {
        const parts = dobText.split('-');
        if (parts.length === 3) dobText = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    document.getElementById('p-dob').textContent = dobText;
    document.getElementById('p-sex').textContent = data.sex || '--';
    
    let activeSince = data.activo_desde || '--';
    if (activeSince.includes('-')) {
        const parts = activeSince.split('-');
        if (parts.length === 3) activeSince = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    document.getElementById('p-active-since').textContent = activeSince;
}

function renderMetrics(m) {
    document.getElementById('m-peso').textContent = m.peso || '--';
    document.getElementById('m-estatura').textContent = m.estatura || '--';
    document.getElementById('m-edad').textContent = m.edad || '--';
    
    const fields = ['cuello', 'espalda', 'torax', 'abdomen', 'cintura'];
    fields.forEach(f => { if(document.getElementById(`m-${f}`)) document.getElementById(`m-${f}`).textContent = m[f] ? `${m[f]} cm` : '--'; });

    if (document.getElementById('m-brazo_der')) document.getElementById('m-brazo_der').textContent = m.brazo_derecho || '--';
    if (document.getElementById('m-brazo_izq')) document.getElementById('m-brazo_izq').textContent = m.brazo_izquierdo || '--';
    if (document.getElementById('m-alergias')) document.getElementById('m-alergias').textContent = m.alergias || 'Ninguna registrada.';
    if (document.getElementById('m-enfermedades')) document.getElementById('m-enfermedades').textContent = m.enfermedades_cronicas || 'Ninguna registrada.';
    if (document.getElementById('m-otros')) document.getElementById('m-otros').textContent = m.otros || 'Sin observaciones.';
}

// ==========================================
// 🚀 INICIALIZACIÓN
// ==========================================
export async function initProfileView() {
    try {
        const [profileRes, metricsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/profile/me`, { headers: getAuthHeaders() }).then(r => r.json()),
            fetch(`${API_BASE_URL}/api/metrics/me`, { headers: getAuthHeaders() }).then(r => r.json())
        ]);

        if (profileRes.success && profileRes.profile) renderProfile(profileRes.profile);
        if (metricsRes.success && metricsRes.metrics) {
            renderMetrics(metricsRes.metrics);
            if (metricsRes.metrics.is_restricted_tier) {
                setTimeout(() => {
                    ['card-upper-body', 'card-lower-body', 'card-medical'].forEach(id => lockDataCard(id, 'STANDARD'));
                }, 150); 
            }
        }

        const spinner = document.getElementById('loading-spinner');
        const content = document.getElementById('profile-content');
        if (spinner) spinner.classList.add('hidden');
        if (content) content.classList.remove('hidden');

    } catch (error) {
        console.error("Error en perfil:", error);
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.innerHTML = '<p class="text-red-400 font-bold uppercase tracking-widest text-xs">❌ Error de conexión.</p>';
    }
}

window.addEventListener('DOMContentLoaded', initProfileView);
