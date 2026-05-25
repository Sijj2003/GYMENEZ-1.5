// static/js/eats.js - GYMENEZ METABOLIC SYSTEMS CON SWAPPER DINÁMICO & PARALLAX

const isLocalhostEnv = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.protocol === 'file:';
const API_BASE_URL = isLocalhostEnv ? 'http://127.0.0.1:5000' : 'https://sijj2003.pythonanywhere.com';

const messagebox = document.getElementById('message-box');
const loadingSpinner = document.getElementById('loading-spinner');
const mainDashboard = document.getElementById('main-dashboard'); // El contendor principal
const eatsContent = document.getElementById('eats-content');
const mealsContainer = document.getElementById('meals-container');
const ultraShowcase = document.getElementById('ultra-showcase'); // El contenedor Parallax

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
        
        // 🚨 SI DA 403, DESPLEGAMOS LA EXPERIENCIA PARALLAX DE VENTA 🚨
        if (resMacros.status === 403) {
            return triggerUltraShowcase();
        }
        
        if (resMacros.status === 401) { 
            showMessage("Sesión expirada.", "error"); 
            setTimeout(() => window.location.href = '/apps/start/login.html', 1500);
            return; 
        }
        
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
        if (loadingSpinner) loadingSpinner.innerHTML = `<p class="text-red-500 font-black uppercase text-[10px] tracking-widest">Fallo crítico de conexión.</p>`;
    }
}

// 👑 FUNCIÓN PARA INVOCAR EL PARALLAX (REEMPLAZA AL CANDADO ANTIGUO)
function triggerUltraShowcase() {
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (mainDashboard) mainDashboard.classList.add('hidden');
    
    if (ultraShowcase) {
        ultraShowcase.classList.remove('hidden');
        // El observer de HTML (final de eats.html) se encargará de las animaciones al hacer scroll.
    }
}

function renderMetabolicDashboard(data) {
    const meta = data.metabolism;
    const macros = data.macros;

    // Asegurarse de que el dashboard sea visible
    if (mainDashboard) mainDashboard.classList.remove('hidden');

    document.getElementById('calories-display').innerHTML = `${meta.tdee}`;
    document.getElementById('basal-display').textContent = `${meta.tmb} kcal`;
    document.getElementById('exercise-display').textContent = `+ ${meta.exercise_expenditure} kcal`;

    document.getElementById('protein-display').innerHTML = `${macros.protein_g}g`;
    document.getElementById('carbs-display').innerHTML = `${macros.carbs_g}g`;
    document.getElementById('fat-display').innerHTML = `${macros.fat_g}g`;

    const statusBanner = document.getElementById('status-banner');
    const carbsStatusTag = document.getElementById('carbs-status-tag');
    const carbsContainer = document.getElementById('carbs-display').parentElement;

    if (meta.is_deload_active) {
        // Rediseño de alerta roja para Deload
        statusBanner.className = 'mt-5 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-400 inline-flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse';
        statusBanner.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> FASE DE DESCARGA: ENERGÍA AMORTIGUADA POR ALTO ACWR`;
        
        carbsStatusTag.textContent = "Restringido (Bajo Gasto)";
        carbsStatusTag.className = "text-[9px] text-red-400/80 block mt-3 font-bold uppercase tracking-wider";
        document.getElementById('carbs-display').classList.replace('text-emerald-400', 'text-red-400');
        
        carbsContainer.classList.remove('border-emerald-500/30', 'bg-gradient-to-b', 'from-emerald-900/20');
        carbsContainer.classList.add('border-red-500/30', 'bg-gradient-to-b', 'from-red-900/20');
        carbsContainer.querySelector('p.text-emerald-400').classList.replace('text-emerald-400', 'text-red-400'); // El titulo "Carbohidratos"
    } else {
        carbsStatusTag.textContent = "Combustible Adaptado";
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
        let totalCals = 0;
        const ingredientsHTML = ['PROTEINA', 'CARBOHIDRATO', 'GRASA'].map(cat => {
            const item = meal.ingredients[cat];
            const calPerGram = (item.data.calories || 0) / 100;
            totalCals += (item.grams * calPerGram);

            const styleConfig = cat === 'PROTEINA' 
                ? { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' }
                : (cat === 'CARBOHIDRATO' 
                    ? { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                    : { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' });

            return `
                <div class="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                    <div class="flex-1 pr-3">
                        <span class="text-[8px] font-black uppercase tracking-widest ${styleConfig.text}">${cat}</span>
                        <p class="text-sm font-black text-white uppercase tracking-tight mt-1 leading-none drop-shadow-md">${item.data.name}</p>
                        <p class="text-[10px] text-gray-400 font-bold mt-1.5 bg-white/5 inline-block px-2 py-0.5 rounded-md border border-white/5">${item.grams} Gramos</p>
                    </div>
                    <button onclick="swapIngredient(${mealIndex}, '${cat}')" class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-[#FFC300] hover:text-black hover:border-[#FFC300] transition-all transform group-hover:scale-110 shadow-lg" title="Rotar Ingrediente">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>
            `;
        }).join('');

        const card = document.createElement('div');
        card.className = 'glass-panel p-6 md:p-8 rounded-[24px] flex flex-col gap-5 border border-white/5 relative overflow-hidden transition-all hover:border-[#FFC300]/30 hover:shadow-[0_0_30px_rgba(255,195,0,0.1)]';
        card.innerHTML = `
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-[#FFC300]/10 blur-[40px] rounded-full -z-10"></div>
            <div class="border-b border-white/10 pb-4 flex justify-between items-end">
                <h5 class="text-base font-black text-white uppercase tracking-tighter">${meal.window_title}</h5>
                <p class="text-2xl font-black text-[#FFC300]">${Math.round(totalCals)} <span class="text-[9px] text-gray-400 font-bold">KCAL</span></p>
            </div>
            <div class="space-y-3">
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
        showMessage("No hay alternativas registradas en el núcleo para esta categoría.", "error");
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
    
    // Feedback táctico para el usuario
    showMessage("Algoritmo ajustado exitosamente.", "success");
    try { navigator.vibrate([50, 50, 50]); } catch(e){}
};

window.addEventListener('DOMContentLoaded', loadMetabolicPlan);
