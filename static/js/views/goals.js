import { API_BASE_URL, getAuthHeaders } from '../core/api.js';
import { showMessage } from '../utils/ui.js';

async function loadGoalsDashboard() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/goals/progress`, { headers: getAuthHeaders() });
        const data = await res.json();

        document.getElementById('loading-spinner').classList.add('hidden');

        if (data.has_active_goal) {
            renderActiveGoal(data.goal_contract);
        } else {
            document.getElementById('create-goal-section').classList.remove('hidden');
        }
        loadUltraReports();
    } catch (e) {
        showMessage("Error de conexión al cargar macrociclos.", "error");
    }
}

function renderActiveGoal(contract) {
    document.getElementById('active-goal-section').classList.remove('hidden');
    document.getElementById('goal-objective-title').textContent = contract.objective;

    const endD = new Date(contract.end_date);
    const diffDays = Math.ceil(Math.abs(endD - new Date()) / (1000 * 60 * 60 * 24));
    document.getElementById('days-remaining').textContent = diffDays > 0 ? diffDays : 'Finalizado';

    const buildBar = (label, initial, target, current) => {
        if (!initial || !target) return '';
        let progress = 0;
        const totalDist = Math.abs(initial - target);
        
        if (totalDist > 0) {
            progress = Math.min((Math.abs(initial - current) / totalDist) * 100, 100);
            if ((initial > target && current > initial) || (target > initial && current < initial)) progress = 0;
        }

        return `
            <div class="bg-black/30 p-4 rounded-2xl border border-white/5">
                <div class="flex justify-between items-end mb-2">
                    <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest">${label}</span>
                    <span class="text-xs font-black text-emerald-400">${Math.round(progress)}%</span>
                </div>
                <div class="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                    <div class="bg-emerald-500 h-3 rounded-full progress-bar-fill" style="width: 0%" data-target-width="${progress}%"></div>
                </div>
            </div>
        `;
    };

    const cPeso = contract.current.peso || contract.start.peso; 
    const cWaist = contract.current.cintura || contract.start.cintura;

    document.getElementById('progress-bars-container').innerHTML = `
        ${buildBar("Peso Corporal (kg)", contract.start.peso, contract.targets.peso, cPeso)}
        ${contract.start.cintura ? buildBar("Cintura (cm)", contract.start.cintura, contract.targets.cintura, cWaist) : ''}
    `;

    setTimeout(() => {
        document.querySelectorAll('.progress-bar-fill').forEach(bar => bar.style.width = bar.getAttribute('data-target-width'));
    }, 100);
}

document.getElementById('goal-form')?.addEventListener('submit', async (e) => {
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
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.success) {
            showMessage("Contrato Sellado. Comienza el trabajo.", "success");
            setTimeout(() => window.location.reload(), 1500);
        } else { showMessage(data.error, "error"); }
    } catch (err) { showMessage("Fallo de red.", "error"); }
});

async function loadUltraReports() {
    document.getElementById('historical-section').classList.remove('hidden');
    const container = document.getElementById('historical-container');
    const lockOverlay = document.getElementById('ultra-lock-overlay');

    try {
        const res = await fetch(`${API_BASE_URL}/api/goals/ultra_reports`, { headers: getAuthHeaders() });
        
        if (res.status === 403) {
            lockOverlay.classList.remove('hidden');
            container.innerHTML = `
                <div class="glass-panel p-5 rounded-2xl border border-white/5 opacity-50">
                    <h5 class="text-xs font-black text-white uppercase">2026-Q1</h5>
                    <div class="h-20 bg-white/5 mt-3 rounded flex items-center justify-center text-[8px] text-gray-500 uppercase">Resumen Oculto</div>
                </div>
            `;
            container.parentElement.classList.add('locked-content');
            return;
        }

        const data = await res.json();
        if (data.reports && data.reports.length > 0) {
            container.innerHTML = data.reports.map(rep => `
                <div class="glass-panel p-5 rounded-2xl border border-white/10">
                    <div class="flex justify-between mb-3">
                        <h5 class="text-xs font-black text-white uppercase">${rep.quarter}</h5>
                        <span class="text-xs font-black text-emerald-400">${rep.success_rate}% Logrado</span>
                    </div>
                    <p class="text-[10px] text-gray-300 bg-black/30 p-3 rounded-xl">" ${rep.coach_summary} "</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = `<p class="text-[10px] text-gray-600 font-black uppercase text-center col-span-2 py-6">Aún no has completado tu primer macrociclo.</p>`;
        }
    } catch (e) { console.log("Módulo Ultra ignorado."); }
}

window.addEventListener('DOMContentLoaded', loadGoalsDashboard);
