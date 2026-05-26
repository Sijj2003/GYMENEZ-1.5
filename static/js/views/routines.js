import { API_BASE_URL, getAuthHeaders } from '../core/api.js';
import { showMessage } from '../utils/ui.js';

function highlightTodayRoutine() {
    const today = new Date();
    const dayIndex = today.getDay(); 
    const daysMap = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
    const todayDayName = daysMap[dayIndex];

    if (todayDayName) {
        const todayCard = document.querySelector(`[data-day="${todayDayName}"]`);
        if (todayCard) {
            setTimeout(() => {
                todayCard.classList.add('today');
                const badge = todayCard.querySelector('.today-badge');
                if (badge) badge.classList.remove('hidden');
            }, 800);
        } else if (todayDayName === 'Domingo') {
            showMessage('Hoy es Domingo. ¡Día de recuperación activa!', 'success');
        }
    }
}

function setupReadinessInterceptor() {
    document.querySelectorAll('.day-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetDay = card.getAttribute('data-day');
            const readinessModal = document.getElementById('readiness-modal');
            const targetInput = document.getElementById('target-workout-day');
            
            if (readinessModal && targetInput) {
                targetInput.value = targetDay;
                readinessModal.classList.remove('hidden');
            } else {
                window.location.href = `workout.html?day=${targetDay}`;
            }
        });
    });

    document.getElementById('readiness-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('readiness-submit-btn');
        btn.disabled = true; btn.textContent = 'CALIBRANDO...';

        try {
            const payload = {
                sleep_score: parseInt(document.querySelector('input[name="sleep_score"]:checked').value),
                stress_score: parseInt(document.querySelector('input[name="stress_score"]:checked').value),
                doms_score: parseInt(document.querySelector('input[name="doms_score"]:checked').value)
            };
            const targetDay = document.getElementById('target-workout-day').value;

            await fetch(`${API_BASE_URL}/api/journal/readiness`, {
                method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload)
            });

            window.location.href = `workout.html?day=${targetDay}`;
        } catch (error) {
            showMessage("Fallo de red. Procediendo con pesos estándar.", "error");
            setTimeout(() => window.location.href = `workout.html?day=${document.getElementById('target-workout-day').value || 'Lunes'}`, 1500);
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    highlightTodayRoutine();
    setupReadinessInterceptor();
});
