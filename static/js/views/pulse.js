import { API_BASE_URL, getAuthHeaders } from '../core/api.js';

export async function loadGymenezPulse() {
    const container = document.getElementById('pulse-alerts-container');
    const badgeCount = document.getElementById('pulse-badge-count');
    const bellBadge = document.getElementById('pulse-bell-badge');
    
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/pulse/alerts`, { headers: getAuthHeaders() });
        const data = await response.json();
        
        if (!data.success || !data.alerts || data.alerts.length === 0) {
            container.innerHTML = `<div class="glass-panel rounded-2xl p-5 text-center"><p class="text-[11px] text-gray-500 uppercase font-mono">⚡ PULSO ESTABLE</p></div>`;
            if (badgeCount) badgeCount.classList.add('hidden');
            if (bellBadge) bellBadge.classList.add('hidden');
            return;
        }

        if (bellBadge) bellBadge.classList.remove('hidden');
        if (badgeCount) {
            badgeCount.textContent = data.alerts.length;
            badgeCount.classList.remove('hidden');
        }

        container.innerHTML = data.alerts.map((alert, index) => {
            const delay = (index * 0.1).toFixed(1);
            if (alert.category === 'COACH_AUDIT') {
                return `<div class="glass-panel p-5 border-red-500/30 shadow-lg fade-in-up" style="animation-delay:${delay}s"><h4 class="text-xs font-black text-red-400 uppercase">${alert.title}</h4><p class="text-xs text-gray-200 mt-2">${alert.content}</p></div>`;
            }
            // (Añade aquí los demás templates de 'PROMO', 'PLUS_INFO' que tenías, simplificados)
            return `<div class="glass-panel p-4 border-white/5 fade-in-up" style="animation-delay:${delay}s"><h4 class="text-xs font-bold text-white uppercase">${alert.title}</h4><p class="text-xs text-gray-400 mt-1">${alert.content}</p></div>`;
        }).join('');

    } catch (error) {
        console.error("Error en pulso:", error);
    }
}

window.scrollToPulseCard = function() {
    const pulseSection = document.getElementById('pulse-alerts-container');
    if (pulseSection) {
        pulseSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        pulseSection.classList.add('ring-2', 'ring-[#FFC300]/40', 'scale-[1.02]');
        setTimeout(() => pulseSection.classList.remove('ring-2', 'ring-[#FFC300]/40', 'scale-[1.02]'), 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userSession')) loadGymenezPulse();
});
