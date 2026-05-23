// static/js/eats.js - Motor Bioquímico de Precisión GYMENEZ

const API_BASE_URL = 'https://sijj2003.pythonanywhere.com';

// =======================================================
// 🛡️ FUNCIÓN DE SEGURIDAD: OBTENER TOKEN
// =======================================================
function getBearerToken() {
    const token = localStorage.getItem('gymen_auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// =======================================================
// 🧬 CARGA Y ORQUESTACIÓN DEL MOTOR METABÓLICO
// =======================================================
async function loadMetabolicEngine() {
    const token = localStorage.getItem('gymen_auth_token');
    if (!token) {
        window.location.href = '/apps/start/login.html';
        return;
    }

    try {
        // Llamada directa al núcleo de bio-ingeniería nutricional del servidor
        const response = await fetch(`${API_BASE_URL}/api/eats/macros`, {
            headers: getBearerToken()
        });

        // 🛡️ MANEJO DE ESCUDO DE PLANES (Control Zero Trust en Frontend)
        if (response.status === 403) {
            document.getElementById('loading-spinner').innerHTML = `
                <div class="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl text-center max-w-md mx-auto msg-animate">
                    <p class="text-red-400 font-black uppercase tracking-widest text-xs">🔒 MÓDULO BLOQUEADO</p>
                    <p class="text-gray-400 text-[11px] mt-2 leading-relaxed">
                        GYMENEZ EATS (Planificación Bioquímica Avanzada) está reservado exclusivamente para atletas del 
                        <span class="text-[#FFC300] font-bold">PLAN ULTRA</span>. Mejora tu suscripción en el panel.
                    </p>
                </div>`;
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            document.getElementById('loading-spinner').innerHTML = `
                <div class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center max-w-sm mx-auto">
                    <p class="text-yellow-500 text-xs font-bold uppercase tracking-widest">⚠️ FICHA BIOMÉTRICA INCOMPLETA</p>
                    <p class="text-gray-400 text-[10px] mt-1">Por favor, solicite la actualización de su peso y altura base en recepción.</p>
                </div>`;
            return;
        }

        const met = data.metabolism;
        const mac = data.macros;

        // 1. Renderizado de Presupuesto Energético
        document.getElementById('calories-display').innerHTML = `${Math.round(met.tdee)} <span class="text-xl text-gray-500 font-bold">KCAL</span>`;
        document.getElementById('basal-display').textContent = `${Math.round(met.tmb)} kcal`;
        document.getElementById('exercise-display').textContent = `+${met.exercise_expenditure} kcal`;

        // 2. Renderizado de Macronutrientes Dinámicos
        document.getElementById('protein-display').innerHTML = `${mac.protein_g}<span class="text-xs text-gray-500 ml-0.5">G</span>`;
        document.getElementById('carbs-display').innerHTML = `${mac.carbs_g}<span class="text-xs text-gray-500 ml-0.5">G</span>`;
        document.getElementById('fat-display').innerHTML = `${mac.fat_g}<span class="text-xs text-gray-500 ml-0.5">G</span>`;

        // 3. Modificación del Estatus Visual según Directrices del Radar ACWR
        const carbsTag = document.getElementById('carbs-status-tag');
        const statusBanner = document.getElementById('status-banner');
        
        if (met.is_deload_active) {
            if (carbsTag) {
                carbsTag.textContent = "📉 RECORTE POR DELOAD";
                carbsTag.className = "text-[8px] text-red-400 font-bold block mt-0.5";
            }
            if (statusBanner) {
                statusBanner.className = "mt-4 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 inline-flex items-center gap-2";
                statusBanner.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> CONTROL DE DAÑOS ACTIVADO: CALORÍAS CONTENIDAS POR SOBREFATIGA`;
            }
        } else {
            if (carbsTag) {
                carbsTag.textContent = "⚡ CARGA DE ADAPTACIÓN";
                carbsTag.className = "text-[8px] text-emerald-400 font-bold block mt-0.5";
            }
            if (statusBanner) {
                statusBanner.className = "mt-4 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 inline-flex items-center gap-2";
                statusBanner.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> MOTOR AJUSTADO SEGÚN TU TONELAJE DE HOY`;
            }
        }

        // 4. Inyección del Nutrient Timing (Distribución de Comidas Críticas)
        renderMealTiming(mac.carbs_g, mac.protein_g, mac.fat_g);

        // 5. Apagar Capa de Carga y mostrar panel principal
        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('eats-content').classList.remove('hidden');

    } catch (error) {
        console.error("Fallo perimetral en conexión bioquímica:", error);
        document.getElementById('loading-spinner').innerHTML = `
            <p class="text-red-500 font-black text-xs uppercase tracking-widest text-center">
                ❌ ERROR DE SINCRONIZACIÓN CON EL NÚCLEO FINANCIERO-BIOLÓGICO.
            </p>`;
    }
}

// =======================================================
// ⏰ MOTOR DE NUTRIENT TIMING (CRONO-NUTRICIÓN)
// =======================================================
function renderMealTiming(totalCarbs, totalProtein, totalFat) {
    const container = document.getElementById('meals-container');
    if (!container) return;
    container.innerHTML = '';

    // Mapeo biomédico exacto de distribución de nutrientes
    const meals = [
        { name: "Desayuno (Carga Base)", c: 0.20, p: 0.25, f: 0.30, desc: "Alineación energética basal e inhibición del catabolismo proteico nocturno." },
        { name: "Almuerzo (Pre-Entreno)", c: 0.25, p: 0.25, f: 0.30, desc: "Optimización y saturación de glucógeno y aminoácidos plasmáticos antes de la carga." },
        { name: "Cena (Post-Entreno VIP)", c: 0.45, p: 0.35, f: 0.10, desc: "Disparo masivo de insulina para deprimir el cortisol, reponer ATP y reparar tejido miofibrilar." },
        { name: "Snack / Colación", c: 0.10, p: 0.15, f: 0.30, desc: "Soporte lipídico estructural y balance de ácidos grasos esenciales para el sistema nervioso." }
    ];

    meals.forEach(meal => {
        const mCarbs = Math.round(totalCarbs * meal.c);
        const mProtein = Math.round(totalProtein * meal.p);
        const mFat = Math.round(totalFat * meal.f);

        const card = document.createElement('div');
        card.className = 'p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col justify-between msg-animate';
        card.innerHTML = `
            <div>
                <h5 class="text-xs font-black uppercase text-white tracking-wider mb-1">${meal.name}</h5>
                <p class="text-[10px] text-gray-500 font-medium leading-relaxed mb-4">${meal.desc}</p>
            </div>
            <div class="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-center text-[10px] font-mono font-bold">
                <div class="text-emerald-400">HC: ${mCarbs}g</div>
                <div class="text-sky-400">PRO: ${mProtein}g</div>
                <div class="text-yellow-500">GR: ${mFat}g</div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Inicialización perimetral al cargar el árbol del DOM
window.addEventListener('DOMContentLoaded', loadMetabolicEngine);
