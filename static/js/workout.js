// static/js/workout.js

const API_BASE_URL = 'https://sijj2003.pythonanywhere.com'; 
const API_JOURNAL_URL = `${API_BASE_URL}/api/journal/save_session`;
const CONTACT_WHATSAPP = '584148780392'; 
const REDIRECT_URL = '/apps/user/routines.html';
const REDIRECT_TIMEOUT_SECONDS = 25; 

let userId = null;
let userFullName = null; 
let routineExercises = []; 
let redirectTimer = null; 

// === DINAMISMO POR URL ===
const urlParams = new URLSearchParams(window.location.search);
const urlDay = urlParams.get('day');
const CURRENT_DAY = urlDay ? urlDay.charAt(0).toUpperCase() + urlDay.slice(1).toLowerCase() : 'Lunes';

// Elementos DOM Globales
const messagebox = document.getElementById('message-box');
const exercisesContainer = document.getElementById('exercises-container');
const finishRoutineBtn = document.getElementById('finish-routine-btn');

document.title = `Protocolo ${CURRENT_DAY} | GYMENEZ`;
document.getElementById('day-title').textContent = `${CURRENT_DAY}`;

// === REPRODUCTOR NATIVO DE VIDEO (YOUTUBE PARSER) ===
const videoModal = document.getElementById('video-modal');
const videoIframe = document.getElementById('video-iframe');
const videoTitle = document.getElementById('video-title');

function getCleanYouTubeEmbed(url) {
    let videoId = '';
    // Regex para capturar el ID de youtube (watch?v=, youtu.be/, embed/)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
        videoId = match[2];
        // Parámetros mágicos para modo "Elitista": Sin cookies, auto-play, sin branding, sin videos relacionados al final
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1&iv_load_policy=3&disablekb=1`;
    }
    return url; // Si no es youtube, devuelve normal
}

window.openTutorial = async (exerciseName) => {
    try {
        showMessage(`Buscando telemetría...`, 'success');
        const res = await fetch(`${API_BASE_URL}/api/exercises/link_tutorial/${encodeURIComponent(exerciseName)}`);
        const data = await res.json();
        
        if(data.success && data.tutorialLink) {
            const cleanUrl = getCleanYouTubeEmbed(data.tutorialLink);
            
            // Setup Modal
            videoTitle.textContent = exerciseName;
            videoModal.classList.remove('hidden');
            
            // Pequeño delay para el fade-in y el iframe
            setTimeout(() => {
                videoModal.classList.remove('opacity-0');
                videoIframe.src = cleanUrl;
                // Mostrar el iframe después de 1s para que la animación de carga se vea fluida
                setTimeout(() => videoIframe.classList.remove('opacity-0'), 800);
            }, 50);

        } else {
            showMessage('Material audiovisual no disponible.', 'error');
        }
    } catch(e) {
        showMessage('Fallo de conexión.', 'error');
    }
};

document.getElementById('close-video-btn').addEventListener('click', () => {
    videoModal.classList.add('opacity-0');
    setTimeout(() => {
        videoModal.classList.add('hidden');
        videoIframe.src = ""; // Detener el video
        videoIframe.classList.add('opacity-0');
    }, 300);
});

// UI Helpers
function showMessage(message, type = 'success') {
    messagebox.textContent = message;
    messagebox.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl z-[9999] transition-all duration-300 text-center border border-white/10';
    messagebox.classList.add(type === 'success' ? 'bg-emerald-600' : 'bg-red-600', 'text-white');
    messagebox.style.opacity = '1';
    messagebox.style.transform = 'translate(-50%, 0)';
    setTimeout(() => {
        messagebox.style.opacity = '0';
        messagebox.style.transform = 'translate(-50%, -20px)';
    }, 3000);
}

// Lógica de Renderizado de Ejercicios
function renderExercises(exercises) {
    exercisesContainer.innerHTML = ''; 
    document.getElementById('finish-routine-container').classList.add('hidden'); 
    routineExercises = exercises; 
    
    if (exercises.length === 0) {
        document.getElementById('no-data-message').classList.remove('hidden');
        document.getElementById('loading-spinner').classList.add('hidden');
        return;
    }

    document.getElementById('no-data-message').classList.add('hidden');
    document.getElementById('loading-spinner').classList.add('hidden');
    document.getElementById('finish-routine-container').classList.remove('hidden'); 
    
    exercises.sort((a, b) => (a.order || 0) - (b.order || 0));

    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'glass-item-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6';
        
        exercise.status = exercise.status || 'pending'; 
        const cardId = exercise.exerciseName.replace(/\s/g, '-');
        
        card.innerHTML = `
            <div class="w-full md:w-auto flex-grow"> 
                <h3 class="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-2 drop-shadow-md">${exercise.exerciseName || 'Ejercicio'}</h3>
                <div class="flex gap-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <p>Sets: <span class="text-[#FFC300] text-sm">${exercise.sets || '-'}</span></p>
                    <p>Reps: <span class="text-[#FFC300] text-sm">${exercise.reps || '-'}</span></p>
                    <p>Peso: <span class="text-[#FFC300] text-sm">${exercise.weight || 'LIBRE'}</span></p>
                </div>
            </div>
            
            <div class="flex items-center space-x-4 w-full md:w-auto justify-end border-t border-white/5 pt-4 md:border-t-0 md:pt-0">
                <button onclick="window.openTutorial('${exercise.exerciseName.replace(/'/g, "\\'")}')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition group">
                    <svg class="w-4 h-4 group-hover:text-[#FFC300] transition" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5v13L16 10 4.5 3.5z"/></svg>
                    <span class="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Play</span>
                </button>

                <div class="flex space-x-2 bg-black/40 p-1 rounded-xl border border-white/5"> 
                    <button id="completed-button-${cardId}" onclick="window.toggleExerciseStatus('${exercise.exerciseName.replace(/'/g, "\\'")}', 'completed')" class="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-gray-400 hover:text-white transition">
                        Check
                    </button>
                    <button id="skip-button-${cardId}" onclick="window.toggleExerciseStatus('${exercise.exerciseName.replace(/'/g, "\\'")}', 'skipped')" class="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-gray-400 hover:text-white transition">
                        Skip
                    </button>
                </div>
            </div>
        `;
        exercisesContainer.appendChild(card);
        // Set initial state colors
        updateCardUI(exercise.exerciseName, exercise.status);
    });
    
    updateFinishButtonState();
}

function updateCardUI(exerciseName, status) {
    const cardId = exerciseName.replace(/\s/g, '-');
    const cBtn = document.getElementById(`completed-button-${cardId}`);
    const sBtn = document.getElementById(`skip-button-${cardId}`);
    const card = cBtn.closest('.glass-item-card');

    // Resets
    cBtn.className = 'px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition';
    sBtn.className = 'px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition';
    card.classList.remove('is-completed', 'is-skipped');

    if (status === 'completed') {
        cBtn.className = 'px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition';
        card.classList.add('is-completed');
    } else if (status === 'skipped') {
        sBtn.className = 'px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition';
        card.classList.add('is-skipped');
    }
}

function updateFinishButtonState() {
    const allCompleted = routineExercises.length > 0 && routineExercises.every(e => e.status !== 'pending');
    finishRoutineBtn.disabled = !allCompleted;
    finishRoutineBtn.className = `w-full md:w-2/3 py-5 rounded-2xl text-sm tracking-[0.2em] font-black transition duration-300 uppercase shadow-2xl ${allCompleted ? 'bg-[#FFC300] hover:bg-yellow-400 text-black shadow-[0_0_30px_rgba(255,195,0,0.3)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/10'}`;
}

window.toggleExerciseStatus = (exerciseName, statusType) => {
    const exercise = routineExercises.find(e => e.exerciseName === exerciseName);
    if (!exercise) return;
    exercise.status = exercise.status === statusType ? 'pending' : statusType;

    updateCardUI(exerciseName, exercise.status);
    updateFinishButtonState();
};

async function loadRoutine() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/routines/day/${userId}/${CURRENT_DAY}`);
        const data = await response.json();
        
        if (data.success && data.routines.length > 0 && data.routines[0].exercises) {
            renderExercises(data.routines[0].exercises);
        } else {
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('no-data-message').classList.remove('hidden');
        }
    } catch (e) {
        document.getElementById('loading-spinner').innerHTML = `<p class="text-red-500 font-bold uppercase tracking-widest text-[10px]">Error Crítico de Datos</p>`;
    }
}

// Inicialización de la sesión
window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('userSession'));
    if (!session) {
        window.location.href = '/apps/start/login.html';
        return;
    }
    userId = session._id || session.id;
    userFullName = `${session.name || ''} ${session.last_name || ''}`.trim() || userId;
    loadRoutine();
});

// Eventos de Fin de Rutina y Encuesta
finishRoutineBtn.addEventListener('click', () => {
    const screen = document.getElementById('finish-screen');
    const survey = document.getElementById('survey-container');
    const msg = document.getElementById('finish-message');
    
    screen.classList.remove('hidden');
    // Pequeño delay para el fade
    setTimeout(() => screen.classList.remove('opacity-0'), 50);
    
    // Si hay audio, intenta reproducirlo (silenciado si el nav lo bloquea)
    const audio = document.getElementById('fireworks-audio');
    if(audio) audio.play().catch(()=>{});
    
    // Setup Confetti Elegante (Dorado y Blanco)
    const duration = 2500;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFC300', '#ffffff', '#333333'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFC300', '#ffffff', '#333333'] });
        if (Date.now() < end) requestAnimationFrame(frame);
        else {
            msg.style.opacity = 0;
            setTimeout(() => {
                msg.classList.add('hidden');
                survey.classList.remove('hidden');
                setTimeout(() => survey.classList.add('survey-visible'), 50);
            }, 500);
        }
    }());
});

// Control visual del dolor en Encuesta
document.querySelectorAll('input[name="sintio-dolor"]').forEach(r => r.addEventListener('change', (e) => {
    document.getElementById('dolor-details').classList.toggle('hidden', e.target.value !== 'si');
}));

document.querySelectorAll('input[name="tipo-dolor"]').forEach(r => r.addEventListener('change', (e) => {
    document.getElementById('otro-dolor-container').classList.toggle('hidden', e.target.value === 'otro');
}));

// Submit Encuesta
document.getElementById('routine-survey-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showModalContacto();
});

document.getElementById('skip-survey-link').addEventListener('click', (e) => {
    e.preventDefault();
    showModalContacto();
});

function showModalContacto() {
    const survey = document.getElementById('survey-container');
    const contact = document.getElementById('contact-modal');
    
    survey.classList.remove('survey-visible');
    setTimeout(() => {
        survey.classList.add('hidden');
        contact.classList.remove('hidden');
        setTimeout(() => contact.classList.add('survey-visible'), 50);
        startRedirectTimer();
    }, 500);
}

function startRedirectTimer() {
    let count = REDIRECT_TIMEOUT_SECONDS;
    const tc = document.getElementById('timer-count');
    tc.textContent = count;
    redirectTimer = setInterval(() => {
        count--;
        tc.textContent = count;
        if (count <= 0) handleRedirect();
    }, 1000);
}

function handleRedirect(contactWhatsapp = false) {
    clearInterval(redirectTimer);
    if (contactWhatsapp) {
        window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(`Reporte de Sistema: Acabo de terminar mi sesión de ${CURRENT_DAY} y solicito revisión técnica.`)}`, '_blank');
    }
    // Animación de salida
    document.getElementById('finish-screen').classList.add('opacity-0');
    setTimeout(() => { window.location.href = REDIRECT_URL; }, 700);
}

document.getElementById('contact-yes-btn').addEventListener('click', () => handleRedirect(true));
document.getElementById('contact-no-btn').addEventListener('click', () => handleRedirect(false));
