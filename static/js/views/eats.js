// static/js/views/eats.js
import { API_BASE_URL, getAuthHeaders } from '../core/api.js';
import { showMessage } from '../utils/ui.js';

// Elementos del DOM
const loadingSpinner = document.getElementById('loading-spinner');
const mainDashboard = document.getElementById('main-dashboard');
const eatsContent = document.getElementById('eats-content');
const mealsContainer = document.getElementById('meals-container');
const ultraShowcase = document.getElementById('ultra-showcase');

// Estado Global de la Vista
let currentMenu = [];
let foodDictionary = {};

// ==========================================
// 🚀 INICIALIZACIÓN PRINCIPAL
// ==========================================
export async function initEatsView() {
    try {
        const resMacros = await fetch(`${API_BASE_URL}/api/eats/macros`, { 
            headers: getAuthHeaders() 
        });
        
        // Manejo del Paywall (Plan Ultra)
        if (resMacros.status === 403) {
            return triggerUltraShowcase();
        }
        
        // Manejo de expiración (Fallback)
        if (resMacros.status === 401) { 
            showMessage("Sesión expirada. Redirigiendo...", "error"); 
            setTimeout(() => window.location.href = '/apps/start/login.html', 1500);
            return; 
        }
        
        const dataMacros = await resMacros.json();
        if (dataMacros.success) renderMetabolicDashboard(dataMacros);

        // 2. Cargar Menú y Diccionario Dinámico
        const resMenu = await fetch(`${API_BASE_URL}/api/eats/suggested_meals`, { 
            headers: getAuthHeaders() 
        });
        const dataMenu = await resMenu.json();
        
        if (dataMenu.success) {
            currentMenu = dataMenu.menu;
            foodDictionary = dataMenu.food_pools;
            renderDynamicMeals();
        }

    } catch (e) {
        console.error("Error cargando Plan Metabólico:", e);
        if (loadingSpinner) {
            loadingSpinner.innerHTML = `<p class="text-red-500 font-black uppercase text-[10px] tracking-widest">Fallo de conexión.</p>`;
        }
    }
}

// ==========================================
// 🎨 RENDERIZADO DE LA UI
// ==========================================
function triggerUltraShowcase() {
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (mainDashboard) mainDashboard.classList.add('hidden');
    if (ultraShowcase) ultraShowcase.classList.remove('hidden');
}

function renderMetabolicDashboard(data) {
    const { metabolism: meta, macros } = data;

    if (mainDashboard) mainDashboard.classList.remove('hidden');

    document.getElementById('calories-display').textContent = meta.tdee;
    document.getElementById('basal-display').textContent = `${meta.tmb} kcal`;
    document.getElementById('exercise-display').textContent = `+ ${meta.exercise_expenditure} kcal`;

    document.getElementById('protein-display').textContent = `${macros.protein_g}g`;
    document.getElementById('carbs-display').textContent = `${macros.carbs_g}g`;
    document.getElementById('fat-display').textContent = `${macros.fat_g}g`;

    const statusBanner = document.getElementById('status-banner');
    const carbsStatusTag = document.getElementById('carbs-status-tag');
    const carbsContainer = document.getElementById('carbs-display').parentElement;

    if (meta.is_deload_active) {
        statusBanner.className = 'mt-5 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-400 inline-flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse';
        statusBanner.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> FASE DE DESCARGA: ENERGÍA AMORTIGUADA POR ALTO ACWR`;
        
        carbsStatusTag.textContent = "Restringido (Bajo Gasto)";
        carbsStatusTag.className = "text-[9px] text-red-400/80 block mt-3 font-bold uppercase tracking-wider";
        document.getElementById('carbs-display').classList.replace('text-emerald-400', 'text-red-400');
        
        carbsContainer.classList.remove('border-emerald-500/30', 'bg-gradient-to-b', 'from-emerald-900/20');
        carbsContainer.classList.add('border-red-500/30', 'bg-gradient-to-b', 'from-red-900/20');
        const titleP = carbsContainer.querySelector('p.text-emerald-400');
        if(titleP) titleP.classList.replace('text-emerald-400', 'text-red-400');
    } else {
        carbsStatusTag.textContent = "Combustible Adaptado";
    }

    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (eatsContent) eatsContent.classList.remove('hidden');
}

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
                    <button data-meal-idx="${mealIndex}" data-cat="${cat}" class="swap-btn w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-[#FFC300] hover:text-black hover:border-[#FFC300] transition-all transform group-hover:scale-110 shadow-lg" title="Rotar Ingrediente">
                        <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
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

    // Re-bindear eventos (Ya no usamos funciones globales atadas a window)
    document.querySelectorAll('.swap-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mealIndex = parseInt(e.currentTarget.getAttribute('data-meal-idx'));
            const category = e.currentTarget.getAttribute('data-cat');
            swapIngredient(mealIndex, category);
        });
    });
}

// =======================================================
// 🔄 LÓGICA DE INTERCAMBIO (SWAPPER)
// =======================================================
function swapIngredient(mealIndex, category) {
    const meal = currentMenu[mealIndex];
    const targetMacroGrams = meal.macro_targets[category.toLowerCase() === 'grasa' ? 'fats' : category.toLowerCase()]; 
    
    const pool = foodDictionary[category];
    if (!pool || pool.length <= 1) {
        showMessage("No hay alternativas registradas para esta categoría.", "error");
        return;
    }

    const currentName = meal.ingredients[category].data.name;
    let newFood;
    do {
        newFood = pool[Math.floor(Math.random() * pool.length)];
    } while (newFood.name === currentName);

    // REGLA DE 3 INVERSA
    let mainMacroProp = category === 'PROTEINA' ? newFood.protein : (category === 'CARBOHIDRATO' ? newFood.carbs : newFood.fats);
    mainMacroProp = parseFloat(mainMacroProp) || 1; 

    const newGramsRequired = Math.round((targetMacroGrams / mainMacroProp) * 100.0);

    meal.ingredients[category] = {
        data: newFood,
        grams: newGramsRequired
    };

    renderDynamicMeals();
    showMessage("Algoritmo ajustado exitosamente.", "success");
    try { navigator.vibrate([50, 50, 50]); } catch(e){}
}

// Inicialización controlada
window.addEventListener('DOMContentLoaded', initEatsView);
