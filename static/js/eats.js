// static/js/eats.js - GYMENEZ METABOLIC SYSTEMS

// 🚀 DETECTOR INTELIGENTE DE ENTORNO PERIMETRAL
const isLocalhostEnv = window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === 'localhost' || 
                        window.location.protocol === 'file:';

const API_BASE_URL = isLocalhostEnv ? 'http://127.0.0.1:5000' : 'https://sijj2003.pythonanywhere.com';

const messagebox = document.getElementById('message-box');
const loadingSpinner = document.getElementById('loading-spinner');
const eatsContent = document.getElementById('eats-content');

// =======================================================
// 🛡️ SEGURIDAD DE LA BÓVEDA: CONFIGURACIÓN DE CABECERAS
// =======================================================
function getBearerToken() {
    const token = localStorage.getItem('gymen_auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function showMessage(message, type = 'success') {
    if (!messagebox) return;
    messagebox.textContent = message;
    messagebox.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase shadow-2xl z-[9999] transition-all duration-300 text-center border border-white/10 w-11/12 max-w-[350px]';
    messagebox.classList.add(type === 'success' ? 'bg-emerald-600' : 'bg-red-600', 'text-white');
    messagebox.style.opacity = '1';
    messagebox.style.transform = 'translate(-50%, 0)';
    setTimeout(() => {
        messagebox.style.opacity = '0';
        messagebox.style.transform = 'translate(-50%, -20px)';
    }, 3000);
}

// =======================================================
// ⚡ MOTOR DE CARGA Y PROCESAMIENTO BIOQUÍMICO
// =======================================================
async function loadMetabolicPlan() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/eats/macros`, {
            method: 'GET',
            headers: getBearerToken()
        });

        // Control perimetral de acceso por nivel de plan (Aduana Flask)
        if (response.status === 403) {
            handleRestrictedAccess("REQUIERE PLAN ULTRA", "Este módulo ejecuta el reparto bioquímico avanzado basado en tonelaje real. Mejora tu cuenta al Plan Ultra para desbloquearlo.");
            return;
        }
        if (response.status === 401) {
            showMessage("Sesión expirada. Por favor, re-inicia sesión.", "error");
            setTimeout(() => window.location.href = '/apps/start/login.html', 2000);
            return;
        }
        if (response.status === 404) {
            handleRestrictedAccess("FICHA INCOMPLETA", "El motor no puede calcular tu TDEE porque aún no has rellenado tus métricas corporales base (Peso o Estatura) en tu perfil.");
            return;
        }

        const data = await response.json();

        if (data.success) {
            renderMetabolicDashboard(data);
        } else {
            showMessage("Error al procesar el cálculo bionutricional.", "error");
        }
    } catch (e) {
        console.error(e);
        if (loadingSpinner) {
            loadingSpinner.innerHTML = `<p class="text-red-500 font-black uppercase tracking-widest text-[10px]">Fallo crítico de conexión con el núcleo metabólico.</p>`;
        }
    }
}

// =======================================================
// 📊 RENDERIZACIÓN TÁCTICA DEL COCKPIT METABÓLICO
// =======================================================
function renderMetabolicDashboard(data) {
    const meta = data.metabolism;
    const macros = data.macros;

    // 1. Inyección de valores en Tarjetas Bento Principales
    document.getElementById('calories-display').innerHTML = `${meta.tdee} <span class="text-xl text-gray-500 font-bold">KCAL</span>`;
    document.getElementById('basal-display').textContent = `${meta.tmb} kcal`;
    document.getElementById('exercise-display').textContent = `${meta.exercise_expenditure} kcal`;

    document.getElementById('protein-display').innerHTML = `${macros.protein_g}<span class="text-xs text-gray-500 ml-0.5 font-bold">G</span>`;
    document.getElementById('carbs-display').innerHTML = `${macros.carbs_g}<span class="text-xs text-emerald-600 ml-0.5 font-bold">G</span>`;
    document.getElementById('fat-display').innerHTML = `${macros.fat_g}<span class="text-xs text-gray-500 ml-0.5 font-bold">G</span>`;

    // 2. Modificación dinámica de etiquetas según el Radar ACWR (Fase Deload)
    const statusBanner = document.getElementById('status-banner');
    const carbsStatusTag = document.getElementById('carbs-status-tag');

    if (meta.is_deload_active) {
        statusBanner.className = 'mt-4 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 inline-flex items-center gap-2 animate-pulse';
        statusBanner.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span> ALERTA ACWR: MODO DESCARGA ACTIVO (ENERGÍA AMORTIGUADA)`;
        carbsStatusTag.textContent = "Restringido por Fatiga Alta";
        carbsStatusTag.className = "text-[8px] text-red-400 block mt-0.5 font-bold";
    } else {
        carbsStatusTag.textContent = "Combustible de Carga Progresiva";
    }

    // 3. PARTICIÓN DE VENTANAS CRONO-NUTRICIONALES (4 Comidas de Alto Rendimiento)
    const mealsContainer = document.getElementById('meals-container');
    if (mealsContainer) {
        mealsContainer.innerHTML = ''; // Limpiar contenedor
        
        // Estrategia de reparto balanceado por objetivos biológicos
        const mealsSetup = [
            { name: "Comida 1: Carga Inicial", desc: "Pre-Entreno / Activación Mecánica", p: 0.25, c: 0.30, f: 0.20 },
            { name: "Comida 2: Ventana Anabólica", desc: "Post-Entreno / Síntesis de Glucógeno", p: 0.30, c: 0.35, f: 0.15 },
            { name: "Comida 3: Soporte Sistémico", desc: "Merienda de Absorción Intermedia", p: 0.20, c: 0.20, f: 0.30 },
            { name: "Comida 4: Reparación Nocturna", desc: "Cena / Modulación Estructural", p: 0.25, c: 0.15, f: 0.35 }
        ];

        mealsSetup.forEach(meal => {
            const pGrams = Math.round(macros.protein_g * meal.p);
            const cGrams = Math.round(macros.carbs_g * meal.c);
            const fGrams = Math.round(macros.fat_g * meal.f);
            const mealCalories = Math.round((pGrams * 4) + (cGrams * 4) + (fGrams * 9));

            const card = document.createElement('div');
            card.className = 'bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col justify-between transition duration-300 hover:border-emerald-500/20';
            card.innerHTML = `
                <div>
                    <h5 class="text-xs font-black text-white uppercase tracking-tight">${meal.name}</h5>
                    <p class="text-[9px] text-gray-500 font-medium leading-tight mt-0.5">${meal.desc}</p>
                    <p class="text-md font-black text-emerald-400 mt-2 tracking-tighter">${mealCalories} <span class="text-[9px] text-gray-400 font-bold">KCAL</span></p>
                </div>
                <div class="grid grid-cols-3 gap-1 mt-4 pt-2 border-t border-white/5 text-center text-[10px] font-mono font-bold">
                    <div class="bg-white/5 p-1 rounded-lg"><span class="text-sky-400 block text-[8px] font-sans font-black">P</span>${pGrams}g</div>
                    <div class="bg-emerald-500/5 border border-emerald-500/10 p-1 rounded-lg"><span class="text-emerald-400 block text-[8px] font-sans font-black">C</span>${cGrams}g</div>
                    <div class="bg-white/5 p-1 rounded-lg"><span class="text-yellow-500 block text-[8px] font-sans font-black">G</span>${fGrams}g</div>
                </div>
            `;
            mealsContainer.appendChild(card);
        });
    }

    // Quitar estados de carga
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (eatsContent) eatsContent.classList.remove('hidden');
}

// =======================================================
// 🚫 MANEJO DEFENSIVO DE ACCESOS Y ERRORES DE PERFIL
// =======================================================
function handleRestrictedAccess(title, description) {
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (eatsContent) eatsContent.classList.add('hidden');
    
    // Inyectar un panel táctico de bloqueo elegante
    const mainSection = document.querySelector('main');
    const lockPanel = document.createElement('div');
    lockPanel.className = 'w-full max-w-xl mx-auto glass-panel rounded-[32px] p-8 border border-white/10 text-center mt-10 fade-in-up';
    lockPanel.innerHTML = `
        <div class="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400 font-black text-lg">🔒</div>
        <h3 class="text-xl font-black text-white uppercase tracking-tighter">${title}</h3>
        <p class="text-xs text-gray-400 mt-3 leading-relaxed font-medium">${description}</p>
        <a href="/apps/start/inicio.html" class="inline-block mt-6 px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition">Regresar al Hub</a>
    `;
    mainSection.appendChild(lockPanel);
}

// Inicialización Automática al Desplegar el DOM
window.addEventListener('DOMContentLoaded', loadMetabolicPlan);
