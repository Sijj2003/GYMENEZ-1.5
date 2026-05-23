// static/js/routines.js

/**
 * Muestra mensajes flotantes de sistema
 */
function showMessage(message, type = 'success') {
    const messagebox = document.getElementById('message-box');
    if (!messagebox) return;

    messagebox.textContent = message;
    messagebox.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-xs font-black tracking-widest uppercase shadow-2xl z-[9999] transition-all duration-500 pointer-events-none text-center'; 
    messagebox.classList.add(type === 'success' ? 'bg-emerald-500' : 'bg-red-500', 'text-white');
    
    // Mostrar
    messagebox.style.opacity = '1';
    messagebox.style.transform = 'translate(-50%, 0)';
    
    // Ocultar
    setTimeout(() => {
        messagebox.style.opacity = '0';
        messagebox.style.transform = 'translate(-50%, -20px)';
    }, 3000);
}

/**
 * Verifica la sesión del usuario y personaliza el saludo.
 */
function initSession() {
    const storedSession = localStorage.getItem('userSession');
    
    if (!storedSession) {
        window.location.href = '/apps/start/login.html';
        return;
    }

    try {
        const user = JSON.parse(storedSession);
        const firstName = user.name ? user.name.split(' ')[0] : 'Atleta';
        
        // Personaliza el saludo del header
        const greetingElement = document.getElementById('user-greeting');
        if (greetingElement) {
            greetingElement.textContent = `Preparado para la acción, ${firstName}`;
        }
    } catch (e) {
        console.error("Error leyendo la sesión:", e);
    }
}

/**
 * Detecta el día actual y resalta la tarjeta correspondiente.
 */
function highlightTodayRoutine() {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 (Domingo) a 6 (Sábado)

    // Mapeo de índices a los 'data-day' del HTML
    const daysMap = {
        1: 'Lunes',
        2: 'Martes',
        3: 'Miércoles',
        4: 'Jueves',
        5: 'Viernes',
        6: 'Sábado',
        0: 'Domingo' // Día de descanso
    };

    const todayDayName = daysMap[dayIndex];

    if (todayDayName) {
        // Busca la tarjeta que coincide con el día de hoy
        const todayCard = document.querySelector(`[data-day="${todayDayName}"]`);
        
        if (todayCard) {
            // 🚨 CORRECCIÓN DEL GHOST BUG: Esperar a que la tarjeta "nazca" (800ms de animación CSS) 
            // antes de inyectar el pulso esmeralda, evitando que colisionen.
            setTimeout(() => {
                todayCard.classList.add('today');
                const badge = todayCard.querySelector('.today-badge');
                if (badge) {
                    badge.classList.remove('hidden');
                }
            }, 800);
        } else if (todayDayName === 'Domingo') {
            showMessage('Hoy es Domingo. ¡Día de recuperación activa!', 'success');
        }
    }
}

// =======================================================
// 🔥 INTERCEPTOR DEL READINESS CHECK-IN (INTELIGENCIA SINTIENTE)
// =======================================================
function setupReadinessInterceptor() {
    // 1. Interceptar clics en las tarjetas de entrenamiento
    document.querySelectorAll('.day-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault(); // Detenemos la navegación instantánea
            const targetDay = card.getAttribute('data-day');
            
            const readinessModal = document.getElementById('readiness-modal');
            const targetInput = document.getElementById('target-workout-day');
            
            if (readinessModal && targetInput) {
                // Guardamos hacia dónde quería ir el usuario y mostramos el escaneo
                targetInput.value = targetDay;
                readinessModal.classList.remove('hidden');
            } else {
                // Si por alguna razón el modal no existe, lo dejamos pasar (Fallback)
                window.location.href = `workout.html?day=${targetDay}`;
            }
        });
    });

    // 2. Manejar el envío del formulario de Readiness
    const readinessForm = document.getElementById('readiness-form');
    if (readinessForm) {
        readinessForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('readiness-submit-btn');
            btn.disabled = true;
            btn.textContent = 'CALIBRANDO...';

            try {
                // Capturar valores seleccionados por el atleta
                const sleep = parseInt(document.querySelector('input[name="sleep_score"]:checked').value);
                const stress = parseInt(document.querySelector('input[name="stress_score"]:checked').value);
                const doms = parseInt(document.querySelector('input[name="doms_score"]:checked').value);
                const targetDay = document.getElementById('target-workout-day').value;

                // Obtenemos el token para autenticar la petición
                const token = localStorage.getItem('gymen_auth_token');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                // Enviamos la información al Motor Biométrico
                const API_BASE_URL = 'https://sijj2003.pythonanywhere.com';
                await fetch(`${API_BASE_URL}/api/journal/readiness`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ 
                        sleep_score: sleep, 
                        stress_score: stress, 
                        doms_score: doms 
                    })
                });

                // Calibración completada: Redirigimos al túnel de entrenamiento
                window.location.href = `workout.html?day=${targetDay}`;

            } catch (error) {
                console.error("Error sincronizando readiness:", error);
                showMessage("Fallo de red. Procediendo con pesos estándar.", "error");
                
                // Fallback: Si el servidor falla, igual lo dejamos entrenar
                const fallbackDay = document.getElementById('target-workout-day').value || 'Lunes';
                setTimeout(() => {
                    window.location.href = `workout.html?day=${fallbackDay}`;
                }, 1500);
            }
        });
    }
}

// Inicialización al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
    initSession();
    highlightTodayRoutine();
    setupReadinessInterceptor();
});
