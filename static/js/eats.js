// static/js/eats.js - GYMENEZ METABOLIC SYSTEMS CON SWAPPER DINÁMICO

const isLocalhostEnv = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.protocol === 'file:';
const API_BASE_URL = isLocalhostEnv ? 'http://127.0.0.1:5000' : 'https://sijj2003.pythonanywhere.com';

const messagebox = document.getElementById('message-box');
const loadingSpinner = document.getElementById('loading-spinner');
const eatsContent = document.getElementById('eats-content');
const mealsContainer = document.getElementById('meals-container');

// Variables globales para la IA del Frontend
let currentMenu = [];
let foodDictionary = {};

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
    setTimeout(() => { messagebox.style.opacity = '0'; messagebox.style.transform = 'translate(-50%, -20px)'; }, 3000);
}

// 1. CARGAR DATOS BASE Y EL DICCIONARIO
async function loadMetabolicPlan() {
    try {
        const resMacros = await fetch(`${API_BASE_URL}/api/eats/macros`, { headers: getBearerToken() });
        if (resMacros.status === 403) return handleRestrictedAccess("REQUIERE PLAN ULTRA", "Mejora tu cuenta al Plan Ultra para desbloquear el generador de dietas.");
        if (resMacros.status === 401) { showMessage("Sesión expirada.", "error"); return; }
        
        const dataMacros = await resMacros.json();
        if (dataMacros.success) renderMetabolicDashboard(dataMacros);

        // 2. Cargar Menú y Diccionario Dinámico de Firebase
        const resMenu = await fetch(`${API_BASE_URL}/api/eats/suggested_meals`, { headers: getBearerToken() });
        const dataMenu = await resMenu.json();
        
        if (dataMenu.success) {
            currentMenu = dataMenu.menu;
            foodDictionary = dataMenu.food_pools; // Aquí guardamos el arsenal de ingredientes
            renderDynamicMeals();
        }

    } catch (e) {
        console.error(e);
        if (loadingSpinner) loadingSpinner.innerHTML = `<p class="text-red-500 font-black uppercase text-[10px]">Fallo crítico de conexión.</p>`;
    }
}

function renderMetabolicDashboard(data) {
    const meta = data.metabolism;
    const macros = data.macros;

    document.getElementById('calories-display').innerHTML = `${meta.tdee} <span class="text-xl text-gray-500 font-bold">KCAL</span>`;
    document.getElementById('basal-display').textContent = `${meta.tmb} kcal`;
    document.getElementById('exercise-display').textContent = `${meta.exercise_expenditure} kcal`;

    document.getElementById('protein-display').innerHTML = `${macros.protein_g}<span class="text-xs text-gray-500 ml-0.5 font-bold">G</span>`;
    document.getElementById('carbs-display').innerHTML = `${macros.carbs_g}<span class="text-xs text-emerald-600 ml-0.5 font-bold">G</span>`;
    document.getElementById('fat-display').innerHTML = `${macros.fat_g}<span class="text-xs text-gray-500 ml-0.5 font-bold">G</span>`;

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

    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (eatsContent) eatsContent.classList.remove('hidden');
}

// =======================================================
// 🧠 INTELIGENCIA DE RENDERIZADO Y SWAP (CAMBIO DINÁMICO)
// =======================================================
function renderDynamicMeals() {
    if (!mealsContainer) return;
    mealsContainer.innerHTML = '';

    currentMenu.forEach((meal, mealIndex) => {
        // Calcular calorías totales del plato dinámicamente
        let totalCals = 0;
        const ingredientsHTML = ['PROTEINA', 'CARBOHIDRATO', 'GRASA'].map(cat => {
            const item = meal.ingredients[cat];
            const calPerGram = (item.data.calories || 0) / 100;
            totalCals += (item.grams * calPerGram);

            const colors = cat === 'PROTEINA' ? 'text-sky-400 bg-sky-400/10 border-sky-400/20' : 
                           (cat === 'CARBOHIDRATO' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20');

            return `
                <div class="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 group">
                    <div class="flex-1 pr-3">
                        <span class="text-[8px] font-black uppercase tracking-widest ${colors.split(' ')[0]}">${cat}</span>
                        <p class="text-xs font-black text-white uppercase tracking-tight mt-0.5 leading-none">${item.data.name}</p>
                        <p class="text-[10px] text-gray-500 font-bold mt-1">${item.grams} Gramos Netos</p>
                    </div>
                    <button onclick="swapIngredient(${mealIndex}, '${cat}')" class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-[#FFC300] hover:text-black hover:border-[#FFC300] transition group-hover:scale-105" title="Cambiar Ingrediente">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>
            `;
        }).join('');

        const card = document.createElement('div');
        card.className = 'glass-panel p-5 md:p-6 rounded-2xl flex flex-col gap-4 border border-white/10 relative overflow-hidden';
        card.innerHTML = `
            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -z-10"></div>
            <div class="border-b border-white/5 pb-3">
                <h5 class="text-sm font-black text-white uppercase tracking-tighter">${meal.window_title}</h5>
                <p class="text-xl font-black text-emerald-400 mt-1">${Math.round(totalCals)} <span class="text-[10px] text-gray-400">KCAL</span></p>
            </div>
            <div class="space-y-2.5">
                ${ingredientsHTML}
            </div>
        `;
        mealsContainer.appendChild(card);
    });
}

// 🔥 LA MAGIA MATEMÁTICA: CAMBIO Y RECALCULO AL VUELO
window.swapIngredient = function(mealIndex, category) {
    const meal = currentMenu[mealIndex];
    const targetMacroGrams = meal.macro_targets[category.toLowerCase() === 'grasa' ? 'fats' : category.toLowerCase()]; 
    
    // Obtener catálogo disponible para esa categoría desde el diccionario descargado
    const pool = foodDictionary[category];
    if (!pool || pool.length <= 1) {
        showMessage("No hay más alternativas en el diccionario.", "error");
        return;
    }

    // Elegir uno aleatorio que no sea el actual
    const currentName = meal.ingredients[category].data.name;
    let newFood;
    do {
        newFood = pool[Math.floor(Math.random() * pool.length)];
    } while (newFood.name === currentName);

    // REGLA DE 3 INVERSA: ¿Cuántos gramos necesito de la nueva comida?
    let mainMacroProp = category === 'PROTEINA' ? newFood.protein : (category === 'CARBOHIDRATO' ? newFood.carbs : newFood.fats);
    mainMacroProp = parseFloat(mainMacroProp) || 1; // Evitar división por cero

    const newGramsRequired = Math.round((targetMacroGrams / mainMacroProp) * 100.0);

    // Actualizar el estado del menú y volver a dibujar instantáneamente
    meal.ingredients[category] = {
        data: newFood,
        grams: newGramsRequired
    };

    renderDynamicMeals();
    
    // Feedback táctico
    try { navigator.vibrate(50); } catch(e){}
};

function handleRestrictedAccess(title, description) {
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (eatsContent) eatsContent.classList.add('hidden');
    
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

window.addEventListener('DOMContentLoaded', loadMetabolicPlan);
