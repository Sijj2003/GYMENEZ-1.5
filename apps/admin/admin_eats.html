<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GYMENEZ CORE | Diccionario Bioquímico de Alimentos</title>
    <link rel="icon" type="image/png" href="mini_logo.png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght=300;400;600;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../static/css/admin_auth.css">
    <style>
        .food-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); transition: all 0.3s ease; }
        .food-card:hover { border-color: rgba(16, 185, 129, 0.3); background: rgba(255, 255, 255, 0.03); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-[#030305] text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden min-h-screen flex flex-col">

    <div id="message-box" class="fixed top-6 left-1/2 transform -translate-x-1/2 px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-2xl z-[9999] opacity-0 transition-all duration-500 text-center border border-white/10"></div>

    <div class="fixed inset-0 bg-[url('../../static/img/backgrounds/PROFILE_FONDO.png')] bg-cover bg-center opacity-5 -z-10 grayscale"></div>
    <div class="fixed inset-0 bg-gradient-to-b from-[#030305]/50 via-[#030305]/90 to-[#030305] -z-10"></div>

    <header class="w-full border-b border-white/5 bg-black/30 backdrop-blur-md sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></div>
                <h1 class="text-md md:text-lg font-black uppercase tracking-tighter">
                    GYMENEZ <span class="text-gray-500">FOOD DICTIONARY</span>
                </h1>
            </div>
            <a href="dashboard.html" class="px-5 py-2 rounded-full border border-white/10 text-white font-bold text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition">
                Consola Central
            </a>
        </div>
    </header>

    <main class="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 flex-grow">
        
        <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
            <div>
                <p class="text-emerald-400 text-[9px] font-black uppercase tracking-[0.4em] mb-1">Módulo de Suministro Élite</p>
                <h2 class="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
                    Bando de <span class="text-emerald-500">Nutrientes.</span>
                </h2>
            </div>
            <button onclick="toggleFoodForm()" class="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest transition shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                + Indexar Nuevo Alimento
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div id="food-form-container" class="hidden lg:block lg:col-span-4 space-y-6">
                <div class="glass-panel p-6 rounded-2xl border border-white/10 sticky top-24">
                    <h3 class="text-sm font-black uppercase tracking-widest text-white border-b border-white/5 pb-3 mb-4">
                        Matriz de Propiedades (Por 100g)
                    </h3>
                    
                    <form id="food-master-form" class="space-y-4 text-xs font-semibold">
                        <div>
                            <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Nombre Comercial/Científico</label>
                            <input type="text" id="food-name" required placeholder="Ej. Pechuga de Pollo Desosada" class="w-full bg-black/50 border border-white/10 rounded-xl text-white py-2.5 px-3 focus:border-emerald-500 outline-none uppercase font-bold">
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Macro Macro-Categoría</label>
                                <select id="food-category" class="w-full bg-black border border-white/10 rounded-xl text-white py-2.5 px-2 focus:border-emerald-500 outline-none font-bold">
                                    <option value="PROTEINA">PROTEÍNA 🛡️</option>
                                    <option value="CARBOHIDRATO">CARBOHIDRATO ⚡</option>
                                    <option value="GRASA">GRASA HIDRADA 🧠</option>
                                    <option value="VEGETAL">FIBRA/MICRO 🌿</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Tier de Pureza</label>
                                <select id="food-tier" class="w-full bg-black border border-white/10 rounded-xl text-white py-2.5 px-2 focus:border-emerald-500 outline-none font-bold">
                                    <option value="PREMIUM">TIER 1 (PREMIUM)</option>
                                    <option value="STANDARD">TIER 2 (ESTÁNDAR)</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Calorías (Kcal)</label>
                                <input type="number" step="0.1" id="food-calories" required placeholder="0.0" class="w-full bg-black/50 border border-white/10 rounded-xl text-white text-center py-2.5 focus:border-emerald-500 outline-none font-bold">
                            </div>
                            <div>
                                <label class="block text-[8px] font-black text-sky-400 uppercase tracking-widest mb-1">Proteínas (g)</label>
                                <input type="number" step="0.1" id="food-protein" required placeholder="0.0" class="w-full bg-black/50 border border-white/10 rounded-xl text-white text-center py-2.5 focus:border-emerald-500 outline-none font-bold">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Carbohidratos (g)</label>
                                <input type="number" step="0.1" id="food-carbs" required placeholder="0.0" class="w-full bg-black/50 border border-white/10 rounded-xl text-white text-center py-2.5 focus:border-emerald-500 outline-none font-bold">
                            </div>
                            <div>
                                <label class="block text-[8px] font-black text-yellow-500 uppercase tracking-widest mb-1">Grasas (g)</label>
                                <input type="number" step="0.1" id="food-fats" required placeholder="0.0" class="w-full bg-black/50 border border-white/10 rounded-xl text-white text-center py-2.5 focus:border-emerald-500 outline-none font-bold">
                            </div>
                        </div>

                        <div>
                            <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Destacado Micronutricional / Trazabilidad</label>
                            <input type="text" id="food-micros" placeholder="Ej. Alto en Zinc, Hierro y Vitamina B12" class="w-full bg-black/50 border border-white/10 rounded-xl text-white py-2.5 px-3 focus:border-emerald-500 outline-none font-medium">
                        </div>

                        <button type="submit" class="w-full bg-white text-black font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl mt-4 hover:bg-gray-200 transition">
                            Sellar e Inyectar a Firestore
                        </button>
                    </form>
                </div>
            </div>

            <div class="lg:col-span-8 space-y-6">
                <div class="flex items-center bg-white/[0.02] border border-white/10 focus-within:border-emerald-500/40 rounded-xl px-4 py-3 transition-all">
                    <svg class="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" id="search-food-input" placeholder="Buscar ingrediente en el diccionario máster..." autocomplete="off" class="w-full bg-transparent text-xs text-white placeholder-gray-600 font-medium outline-none">
                </div>

                <div id="loading-spinner" class="flex flex-col items-center justify-center py-20">
                    <div class="w-8 h-8 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                </div>

                <div id="food-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-4 hidden">
                    </div>
            </div>

        </div>
    </main>

    <script src="../../static/js/admin_auth.js"></script>

    <script>
        let fullFoodDictionary = [];

        function showNotification(msg, isError = false) {
            const box = document.getElementById('message-box');
            if(!box) return;
            box.textContent = msg;
            box.className = `fixed top-6 left-1/2 transform -translate-x-1/2 px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-2xl z-[9999] transition-all duration-300 text-center ${isError ? 'bg-red-600':'bg-emerald-600'} text-white border border-white/10`;
            box.style.opacity = '1';
            setTimeout(() => box.style.opacity = '0', 3000);
        }

        function toggleFoodForm() {
            const f = document.getElementById('food-form-container');
            f.classList.toggle('hidden');
        }

        // =======================================================
        // 📥 DESCARGAR DICCIONARIO DESDE EL BACKEND
        // =======================================================
        async function fetchFoodDictionary() {
            try {
                // Endpoint administrativo que crearemos a continuación
                const res = await fetch(`${API_BASE_URL}/api/admin/food_dictionary`);
                if (res.status === 401) {
                    showNotification("Sesión administrativa expirada.", true);
                    return;
                }
                const data = await res.json();
                
                if (data.success && data.dictionary) {
                    fullFoodDictionary = data.dictionary;
                    renderFoodGrid(fullFoodDictionary);
                }
            } catch (err) {
                console.error(err);
                showNotification("Fallo al sincronizar el banco de alimentos.", true);
            } finally {
                document.getElementById('loading-spinner').classList.add('hidden');
                document.getElementById('food-grid').classList.remove('hidden');
            }
        }

        // =======================================================
        // 📊 RENDERIZACIÓN DE TARJETAS TÁCTICAS
        // =======================================================
        function renderFoodGrid(list) {
            const grid = document.getElementById('food-grid');
            grid.innerHTML = '';

            if(list.length === 0) {
                grid.innerHTML = `<p class="col-span-2 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest py-10">Diccionario vacío o sin coincidencias.</p>`;
                return;
            }

            list.forEach(item => {
                const card = document.createElement('div');
                card.className = "food-card p-5 rounded-2xl flex flex-col justify-between gap-4";
                
                const catColor = item.category === 'PROTEINA' ? 'text-sky-400' : (item.category === 'CARBOHIDRATO' ? 'text-emerald-400' : 'text-yellow-500');
                const tierColor = item.tier === 'PREMIUM' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' : 'border-white/10 text-gray-400 bg-white/5';

                card.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start gap-2">
                            <h4 class="text-sm font-black text-white uppercase tracking-tight break-words max-w-[70%]">${item.name}</h4>
                            <span class="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${tierColor}">${item.tier}</span>
                        </div>
                        <p class="text-[8px] font-black uppercase tracking-wider mt-1 ${catColor}">${item.category}</p>
                        <p class="text-[10px] text-gray-500 font-medium mt-2 italic">“${item.micros || 'Sin trazas destacadas'}”</p>
                    </div>

                    <div class="border-t border-white/5 pt-3">
                        <p class="text-xl font-black text-white tracking-tighter">${item.calories} <span class="text-[9px] text-gray-500 font-bold">KCAL / 100G</span></p>
                        <div class="grid grid-cols-3 gap-1.5 mt-2.5 text-center text-[9px] font-mono font-bold">
                            <div class="bg-white/5 p-1 rounded-lg"><span class="text-sky-400 block text-[7px] font-sans font-black">P</span>${item.protein}g</div>
                            <div class="bg-white/5 p-1 rounded-lg"><span class="text-emerald-400 block text-[7px] font-sans font-black">C</span>${item.carbs}g</div>
                            <div class="bg-white/5 p-1 rounded-lg"><span class="text-yellow-500 block text-[7px] font-sans font-black">G</span>${item.fats}g</div>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // Buscador Inteligente en Tiempo Real
        document.getElementById('search-food-input').addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = fullFoodDictionary.filter(item => 
                item.name.toLowerCase().includes(q) || 
                item.category.toLowerCase().includes(q)
            );
            renderFoodGrid(filtered);
        });

        // =======================================================
        // 📤 ENVÍO DE DATOS HACIA EL SERVIDOR FIRESTORE
        // =======================================================
        document.getElementById('food-master-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                name: document.getElementById('food-name').value.toUpperCase().trim(),
                category: document.getElementById('food-category').value,
                tier: document.getElementById('food-tier').value,
                calories: parseFloat(document.getElementById('food-calories').value) || 0,
                protein: parseFloat(document.getElementById('food-protein').value) || 0,
                carbs: parseFloat(document.getElementById('food-carbs').value) || 0,
                fats: parseFloat(document.getElementById('food-fats').value) || 0,
                micros: document.getElementById('food-micros').value.trim()
            };

            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/food_dictionary`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }, // admin_auth.js inyectará el Bearer Token automáticamente
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (data.success) {
                    showNotification("Alimento indexado con éxito científico.", false);
                    document.getElementById('food-master-form').reset();
                    fetchFoodDictionary(); // Recargar rejilla
                } else {
                    showNotification("Error al inyectar el ingrediente.", true);
                }
            } catch (err) {
                showNotification("Error de enlace perimetral.", true);
            }
        });

        window.addEventListener('DOMContentLoaded', fetchFoodDictionary);
    </script>
</body>
</html>
