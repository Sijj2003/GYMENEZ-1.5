// static/js/goals.js - CONTROLADOR DE MACROCICLOS

const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
const API_BASE_URL = isLocalhost ? 'http://127.0.0.1:5000' : 'https://sijj2003.pythonanywhere.com';

function getBearerToken() {
    const t = localStorage.getItem('gymen_auth_token');
    return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : {};
}

function showMsg(msg, isError=false) {
    const b = document.getElementById('message-box');
    b.textContent = msg;
    b.className = `fixed top-6 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-full text-[10px] font-black tracking-widest uppercase shadow-2xl z-[9999] transition-all duration-300 text-center border border-white/10 ${isError?'bg-red-600':'bg-emerald-600'} text-white`;
    b.style.opacity = '1'; b.style.transform = 'translate(-50%, 0)';
    setTimeout(() => { b.style.opacity = '0'; b.style.transform = 'translate(-50%, -20px)'; }, 3500);
}

// ==========================================
// 🚀 1. CARGAR ESTADO DEL USUARIO
// ==========================================
async function loadGoalsDashboard() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/goals/progress`, { headers: getBearerToken() });
        const data = await res.json();

        document.getElementById('loading-spinner').classList.add('hidden');

        if (data.has_active_goal) {
            renderActiveGoal(data.goal_contract);
        } else {
            document.getElementById('create-goal-section').classList.remove('hidden');
        }

        // Cargar Historial Ultra
        loadUltraReports();

    } catch (e) {
        showMsg("Error de conexión al cargar macrociclos.", true);
    }
}

// ==========================================
// 📊 2. RENDERIZAR BARRAS DINÁMICAS
// ==========================================
function renderActiveGoal(contract) {
    document.getElementById('active-goal-section').classList.remove('hidden');
    document.getElementById('goal-objective-title').textContent = contract.objective;

    // Calcular días restantes
    const endD = new Date(contract.end_date);
    const today = new Date();
    const diffTime = Math.abs(endD - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('days-remaining').textContent = diffDays > 0 ? diffDays : 'Finalizado';

    // Función matemática de la barra
    const buildBar = (label, initial, target, current) => {
        if (!initial || !target) return '';
        
        let progress = 0;
        const totalDist = Math.abs(initial - target);
        
        if (totalDist > 0) {
            const currentDist = Math.abs(initial - current);
            // Evitar que la barra pase del 100% si ya lo superó
            progress = Math.min((currentDist / totalDist) * 100, 100);
            
            // Si el objetivo es bajar y el actual es mayor que el inicial, progreso = 0
            if (initial > target && current > initial) progress = 0;
            // Si el objetivo es subir y el actual es menor que el inicial, progreso = 0
            if (target > initial && current < initial) progress = 0;
        }

        return `
            <div class="bg-black/30 p-4 rounded-2xl border border-white/5">
                <div class="flex justify-between items-end mb-2">
                    <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest">${label}</span>
                    <span class="text-xs font-black text-emerald-400">${Math.round(progress)}% Completado</span>
                </div>
                <div class="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                    <div class="bg-emerald-500 h-3 rounded-full progress-bar-fill" style="width: 0%" data-target-width="${progress}%"></div>
                </div>
                <div class="flex justify-between mt-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>Inicio: ${initial}</span>
                    <span>Actual: ${current}</span>
                    <span class="text-white">Meta: ${target}</span>
                </div>
            </div>
        `;
    };

    const cPeso = contract.current.peso || contract.start.peso; // Si no ha actualizado perfil, asume el inicial
    const cWaist = contract.current.cintura || contract.start.cintura;

    const barsHTML = `
        ${buildBar("Peso Corporal (kg)", contract.start.peso, contract.targets.peso, cPeso)}
        ${contract.start.cintura ? buildBar("Contorno de Cintura (cm)", contract.start.cintura, contract.targets.cintura, cWaist) : ''}
    `;

    document.getElementById('progress-bars-container').innerHTML = barsHTML;

    // Animación de llenado suave al cargar
    setTimeout(() => {
        document.querySelectorAll('.progress-bar-fill').forEach(bar => {
            bar.style.width = bar.getAttribute('data-target-width');
        });
    }, 100);
}

// ==========================================
// 📝 3. SELLAR NUEVO CONTRATO
// ==========================================
document.getElementById('goal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        biological_objective: document.getElementById('goal-objective').value,
        starting_metrics: {
            peso: parseFloat(document.getElementById('start-weight').value),
            cintura: parseFloat(document.getElementById('start-waist').value) || null
        },
        target_metrics: {
            peso: parseFloat(document.getElementById('target-weight').value),
            cintura: parseFloat(document.getElementById('target-waist').value) || null
        }
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/goals/set_quarter`, {
            method: 'POST', headers: getBearerToken(), body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.success) {
            showMsg("Contrato Sellado. Comienza el trabajo.");
            setTimeout(() => window.location.reload(), 1500);
        } else { showMsg(data.error, true); }
    } catch (err) { showMsg("Fallo en la matriz de red.", true); }
});

// ==========================================
// 👑 4. CARGAR BÓVEDA ULTRA (REPORTS)
// ==========================================
async function loadUltraReports() {
    document.getElementById('historical-section').classList.remove('hidden');
    const container = document.getElementById('historical-container');
    const lockOverlay = document.getElementById('ultra-lock-overlay');

    try {
        const res = await fetch(`${API_BASE_URL}/api/goals/ultra_reports`, { headers: getBearerToken() });
        
        if (res.status === 403) {
            // Usuario No es Ultra: Se activa el escudo de desenfoque
            lockOverlay.classList.remove('hidden');
            
            // Ponemos datos falsos (dummy) debajo para que se vea el efecto de lo que se están perdiendo
            container.innerHTML = `
                <div class="glass-panel p-5 rounded-2xl border border-white/5 opacity-50">
                    <h5 class="text-xs font-black text-white uppercase">2026-Q1 (DEFINICION)</h5>
                    <p class="text-[9px] text-emerald-500 font-bold mt-1">Éxito: 85%</p>
                    <div class="h-20 bg-white/5 mt-3 rounded border border-white/10 flex items-center justify-center text-[8px] text-gray-500 uppercase">Resumen de IA Oculto</div>
                </div>
            `;
            container.parentElement.classList.add('locked-content');
            return;
        }

        const data = await res.json();
        if (data.reports && data.reports.length > 0) {
            // Renderizar los reportes reales para el usuario ULTRA
            container.innerHTML = data.reports.map(rep => `
                <div class="glass-panel p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="text-xs font-black text-white uppercase tracking-widest">${rep.quarter} <span class="text-[8px] text-gray-400 block">${rep.objective}</span></h5>
                        <span class="text-xs font-black text-emerald-400">${rep.success_rate}% Logrado</span>
                    </div>
                    <p class="text-[10px] text-gray-300 leading-relaxed font-medium bg-black/30 p-3 rounded-xl border border-white/5">" ${rep.coach_summary} "</p>
                    ${rep.photos.length > 0 ? `<button class="mt-3 text-[9px] font-black text-sky-400 uppercase hover:text-white transition">Ver Galería de Progreso 📸</button>` : ''}
                </div>
            `).join('');
        } else {
            container.innerHTML = `<p class="text-[10px] text-gray-600 font-black uppercase tracking-widest text-center col-span-2 py-6">Aún no has completado tu primer macrociclo.</p>`;
        }

    } catch (e) {
        console.log("Módulo Ultra ignorado temporalmente.");
    }
}

window.addEventListener('DOMContentLoaded', loadGoalsDashboard);
