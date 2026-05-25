// static/js/pulse.js - Sincronización y Renderizado de Alertas Gymenez Pulse

async function loadGymenezPulse() {
    const container = document.getElementById('pulse-alerts-container');
    const badgeCount = document.getElementById('pulse-badge-count');
    const bellBadge = document.getElementById('pulse-bell-badge');
    
    if (!container) return;

    try {
        // Ejecutar extracción pasiva limpia contra el endpoint segmentado
        const response = await fetch('/api/pulse/alerts', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error("Fallo en sincronización perimetral.");

        const data = await response.json();
        
        // Si la pizarra está en paz, apagamos los indicadores visuales de alertas
        if (!data.success || !data.alerts || data.alerts.length === 0) {
            container.innerHTML = `
                <div class="glass-panel rounded-2xl p-5 text-center border border-white/5">
                    <p class="text-[11px] text-gray-500 uppercase tracking-wider font-medium font-mono">⚡ PULSO ESTABLE • SIN ALERTAS VIGENTES</p>
                </div>
            `;
            if (badgeCount) badgeCount.classList.add('hidden');
            if (bellBadge) bellBadge.classList.add('hidden');
            return;
        }

        // 🔔 Encender el escudo de la campana superior y el contador del hub
        if (bellBadge) bellBadge.classList.remove('hidden');
        if (badgeCount) {
            badgeCount.textContent = data.alerts.length;
            badgeCount.classList.remove('hidden');
        }

        // Limpiar el contenedor para procesar la inyección polimórfica
        container.innerHTML = '';

        data.alerts.forEach(alert => {
            let cardTemplate = '';

            switch(alert.category) {
                case 'COACH_AUDIT': // 🚨 Canal de Auditoría Crítica Directa (Solo Atletas ULTRA)
                    cardTemplate = `
                        <div class="glass-panel rounded-2xl p-5 border border-red-500/30 bg-gradient-to-r from-red-950/10 to-transparent shadow-[0_0_30px_rgba(220,38,38,0.05)]">
                            <div class="flex items-start gap-3">
                                <span class="text-base mt-0.5">🚨</span>
                                <div class="flex-1">
                                    <h4 class="text-xs font-black text-red-400 uppercase tracking-wide font-mono">${alert.title}</h4>
                                    <p class="text-xs text-gray-200 mt-2 leading-relaxed font-medium">${alert.content}</p>
                                    <div class="text-[9px] text-red-500/60 font-black mt-3 uppercase tracking-widest font-mono">⚠️ ORDEN DIRECTA DEL STAFF TÉCNICO</div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                case 'PROMO': // 🧲 Módulo Gancho de Conversión Monetaria (Solo Cuentas BÁSICAS)
                    cardTemplate = `
                        <div class="glass-panel rounded-2xl p-5 border border-[#FFC300]/30 bg-gradient-to-br from-yellow-500/5 to-transparent shadow-xl">
                            <div class="flex items-start gap-3">
                                <span class="text-base mt-0.5">👑</span>
                                <div class="flex-1">
                                    <h4 class="text-xs font-black text-[#FFC300] uppercase tracking-wider font-mono">${alert.title}</h4>
                                    <p class="text-xs text-gray-300 mt-1.5 leading-relaxed">${alert.content}</p>
                                    <button onclick="window.location.href='/apps/user/checkout.html'" class="mt-4 bg-[#FFC300] hover:bg-yellow-400 text-black font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(255,195,0,0.15)]">
                                        MEJORAR PLAN AHORA
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                case 'PLUS_INFO':
                case 'PLAN_INFO': // 📘 Alertas de Comunidad y Ajustes de Plantilla (Standard / Plus)
                    cardTemplate = `
                        <div class="glass-panel rounded-2xl p-4 border border-blue-500/20 bg-gradient-to-r from-blue-950/5 to-transparent shadow-md">
                            <div class="flex items-start gap-3">
                                <span class="text-base mt-0.5">💎</span>
                                <div class="flex-1">
                                    <h4 class="text-xs font-black text-blue-400 uppercase tracking-wide font-mono">${alert.title}</h4>
                                    <p class="text-xs text-gray-300 mt-1 leading-relaxed font-medium">${alert.content}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                default: // 🌐 Comunicados e Hitos Globales Comunes del Gimnasio
                    cardTemplate = `
                        <div class="glass-panel rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors duration-300">
                            <div class="flex items-start gap-3">
                                <span class="text-base mt-0.5">📢</span>
                                <div class="flex-1">
                                    <h4 class="text-xs font-bold text-white uppercase tracking-tight">${alert.title}</h4>
                                    <p class="text-xs text-gray-400 mt-1 leading-relaxed">${alert.content}</p>
                                </div>
                            </div>
                        </div>
                    `;
            }

            container.insertAdjacentHTML('beforeend', cardTemplate);
        });

    } catch (error) {
        console.error("🔴 Error crítico en renderizador del pulso:", error);
    }
}

// 🚀 EFECTO VISUAL PREMUM: Desplazamiento Enfocado y Destello de Neón al presionar la campana
function scrollToPulseCard() {
    const pulseSection = document.getElementById('pulse-alerts-container');
    if (pulseSection) {
        // Desplazamiento fluido hacia el objetivo
        pulseSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Inyectar anillo de luz neón y pulso de tamaño
        pulseSection.classList.add('ring-2', 'ring-[#FFC300]/40', 'scale-[1.02]', 'shadow-[0_0_30px_rgba(255,195,0,0.1)]');
        
        // Apagar el efecto de forma suavizada tras 1000ms
        setTimeout(() => {
            pulseSection.classList.remove('ring-2', 'ring-[#FFC300]/40', 'scale-[1.02]', 'shadow-[0_0_30px_rgba(255,195,0,0.1)]');
        }, 1000);
    }
}

// Inicialización automática atada a la existencia de la sesión del Atleta
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userSession')) {
        loadGymenezPulse();
    }
});
