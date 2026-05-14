// static/js/workout.js

const API_BASE_URL = 'https://sijj2003.pythonanywhere.com'; 
const API_JOURNAL_URL = `${API_BASE_URL}/api/journal/save_session`;
const CONTACT_WHATSAPP = '584148780392'; 
const REDIRECT_URL = '/templates/user/routines.html';
const REDIRECT_TIMEOUT_SECONDS = 25; 

let userId = null;
let userFullName = null; 
let routineExercises = []; 
let redirectTimer = null; 

// === 1. DINAMISMO POR URL ===
const urlParams = new URLSearchParams(window.location.search);
const urlDay = urlParams.get('day');
// Valida que el día exista o usa 'Lunes' por defecto. Formatea la primera letra a Mayúscula.
const CURRENT_DAY = urlDay ? urlDay.charAt(0).toUpperCase() + urlDay.slice(1).toLowerCase() : 'Lunes';

// Elementos DOM
const messagebox = document.getElementById('message-box');
const loadingSpinner = document.getElementById('loading-spinner');
const exercisesContainer = document.getElementById('exercises-container');
const noDataMessage = document.getElementById('no-data-message');
const dayTitle = document.getElementById('day-title');
const finishRoutineContainer = document.getElementById('finish-routine-container');
const finishRoutineBtn = document.getElementById('finish-routine-btn');
const finishScreen = document.getElementById('finish-screen');
const fireworksAudio = document.getElementById('fireworks-audio');

// Elementos Encuesta
const finishMessage = document.getElementById('finish-message');
const surveyContainer = document.getElementById('survey-container');
const surveyForm = document.getElementById('routine-survey-form');
const skipSurveyLink = document.getElementById('skip-survey-link');
const dolorSi = document.getElementById('dolor-si');
const dolorNo = document.getElementById('dolor-no');
const dolorDetails = document.getElementById('dolor-details');
const tipoDolorRadios = document.getElementsByName('tipo-dolor');
const otroDolorContainer = document.getElementById('otro-dolor-container');
const contactModal = document.getElementById('contact-modal');
const contactYesBtn = document.getElementById('contact-yes-btn');
const contactNoBtn = document.getElementById('contact-no-btn');
const timerCount = document.getElementById('timer-count');

// Establecer título dinámicamente
document.title = `Rutina ${CURRENT_DAY} | GYMENEZ`;
dayTitle.textContent = `DÍA: ${CURRENT_DAY}`;

// UI Helpers
function showMessage(message, type = 'success') {
    messagebox.textContent = message;
    messagebox.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-xs font-black tracking-widest uppercase shadow-2xl z-[3000] transition-all duration-300 text-center';
    messagebox.classList.add(type === 'success' ? 'bg-emerald-500' : 'bg-red-500', 'text-white');
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
    finishRoutineContainer.classList.add('hidden'); 
    routineExercises = exercises; 
    
    if (exercises.length === 0) {
        noDataMessage.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
        return;
    }

    noDataMessage.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    finishRoutineContainer.classList.remove('hidden'); 
    
    exercises.sort((a, b) => (a.order || 0) - (b.order || 0));

    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'glass-item-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4';
        
        exercise.status = exercise.status || 'pending'; 
        const cardId = exercise.exerciseName.replace(/\s/g, '-');
        
        let completeBtnBgClass = 'bg-emerald-600 hover:bg-emerald-500';
        let completeBtnText = 'COMPLETAR';
        let skipBtnBgClass = 'bg-red-600 hover:bg-red-500';
        let skipBtnText = 'SALTAR';
        let circleBgClass = 'bg-gray-700';

        if (exercise.status === 'completed') {
            completeBtnBgClass = 'bg-gray-700 hover:bg-gray-600';
            completeBtnText = 'HECHO';
            circleBgClass = 'bg-emerald-500';
        } else if (exercise.status === 'skipped') {
            skipBtnBgClass = 'bg-gray-700 hover:bg-gray-600';
            skipBtnText = 'SALTADO';
            circleBgClass = 'bg-red-500';
        }
        
        card.innerHTML = `
            <div class="text-contrast-dark w-full md:w-1/2"> 
                <p class="text-xl font-black text-[#FFC300] uppercase tracking-tighter mb-1">${exercise.exerciseName || 'Ejercicio'}</p>
                <div class="flex gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <p>Series: <span class="text-white">${exercise.sets || '-'}</span></p>
                    <p>Reps: <span class="text-white">${exercise.reps || '-'}</span></p>
                    <p>Peso: <span class="text-white">${exercise.weight || 'N/A'}</span></p>
                </div>
            </div>
            
            <div class="flex items-center space-x-3 w-full md:w-auto justify-end">
                <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto"> 
                    <button id="completed-button-${cardId}" onclick="window.toggleExerciseStatus('${exercise.exerciseName.replace(/'/g, "\\'")}', 'completed')" class="w-full md:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg ${completeBtnBgClass} text-white transition">
                        ${completeBtnText}
                    </button>
                    <button onclick="window.openTutorial('${exercise.exerciseName.replace(/'/g, "\\'")}')" class="w-full md:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg bg-[#FFC300] text-black hover:bg-yellow-400 transition">
                        TUTORIAL
                    </button>
                    <button id="skip-button-${cardId}" onclick="window.toggleExerciseStatus('${exercise.exerciseName.replace(/'/g, "\\'")}', 'skipped')" class="w-full md:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg ${skipBtnBgClass} text-white transition">
                        ${skipBtnText}
                    </button>
                </div>
                <div id="completed-indicator-${cardId}" class="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${circleBgClass} text-white transition-colors duration-300">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                </div>
            </div>
        `;
        exercisesContainer.appendChild(card);
    });
    
    updateFinishButtonState();
}

function updateFinishButtonState() {
    const allCompleted = routineExercises.length > 0 && routineExercises.every(e => e.status !== 'pending');
    finishRoutineBtn.disabled = !allCompleted;
    finishRoutineBtn.className = `w-full sm:w-1/2 py-4 rounded-2xl text-sm tracking-widest font-black transition duration-300 uppercase shadow-xl ${allCompleted ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/10'}`;
}

window.toggleExerciseStatus = (exerciseName, statusType) => {
    const exercise = routineExercises.find(e => e.exerciseName === exerciseName);
    if (!exercise) return;
    exercise.status = exercise.status === statusType ? 'pending' : statusType;

    const cardId = exerciseName.replace(/\s/g, '-');
    const indicator = document.getElementById(`completed-indicator-${cardId}`);
    const cBtn = document.getElementById(`completed-button-${cardId}`);
    const sBtn = document.getElementById(`skip-button-${cardId}`);

    // Resets
    indicator.className = `w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-white transition-colors duration-300 ${exercise.status === 'completed' ? 'bg-emerald-500' : (exercise.status === 'skipped' ? 'bg-red-500' : 'bg-gray-700')}`;
    
    cBtn.className = `w-full md:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-white transition ${exercise.status === 'completed' ? 'bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-500'}`;
    cBtn.textContent = exercise.status === 'completed' ? 'HECHO' : 'COMPLETAR';

    sBtn.className = `w-full md:w-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-white transition ${exercise.status === 'skipped' ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-500'}`;
    sBtn.textContent = exercise.status === 'skipped' ? 'SALTADO' : 'SALTAR';

    updateFinishButtonState();
};

window.openTutorial = async (exerciseName) => {
    try {
        showMessage(`Buscando tutorial...`, 'success');
        const res = await fetch(`${API_BASE_URL}/api/exercises/link_tutorial/${encodeURIComponent(exerciseName)}`);
        const data = await res.json();
        if(data.success && data.tutorialLink) {
            window.open(data.tutorialLink, '_blank');
        } else {
            showMessage('Tutorial no configurado.', 'error');
        }
    } catch(e) {
        showMessage('Error conectando al servidor.', 'error');
    }
};

async function loadRoutine() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/routines/day/${userId}/${CURRENT_DAY}`);
        const data = await response.json();
        
        if (data.success && data.routines.length > 0 && data.routines[0].exercises) {
            renderExercises(data.routines[0].exercises);
        } else {
            loadingSpinner.classList.add('hidden');
            noDataMessage.classList.remove('hidden');
        }
    } catch (e) {
        loadingSpinner.innerHTML = `<p class="text-red-500 font-bold">Error al cargar la rutina.</p>`;
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
    finishScreen.classList.add('show');
    fireworksAudio.play().catch(()=>{});
    
    // Confetti Setup
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFC300', '#ffffff'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFC300', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
        else {
            finishMessage.style.opacity = 0;
            setTimeout(() => {
                finishMessage.classList.add('hidden');
                surveyContainer.classList.remove('hidden');
                setTimeout(() => surveyContainer.classList.add('fade-in'), 50);
            }, 500);
        }
    }());
});

// Control visual del dolor
document.getElementsByName('sintio-dolor').forEach(r => r.addEventListener('change', (e) => {
    dolorDetails.classList.toggle('hidden', e.target.value !== 'si');
}));

document.getElementsByName('tipo-dolor').forEach(r => r.addEventListener('change', (e) => {
    otroDolorContainer.classList.toggle('hidden', e.target.value !== 'otro');
}));

// Submit Encuesta
surveyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    surveyContainer.classList.add('hidden');
    contactModal.classList.remove('hidden');
    setTimeout(() => contactModal.classList.add('fade-in'), 50);
    startRedirectTimer();
});

skipSurveyLink.addEventListener('click', (e) => {
    e.preventDefault();
    surveyContainer.classList.add('hidden');
    contactModal.classList.remove('hidden');
    setTimeout(() => contactModal.classList.add('fade-in'), 50);
    startRedirectTimer();
});

function startRedirectTimer() {
    let count = REDIRECT_TIMEOUT_SECONDS;
    timerCount.textContent = count;
    redirectTimer = setInterval(() => {
        count--;
        timerCount.textContent = count;
        if (count <= 0) handleRedirect();
    }, 1000);
}

function handleRedirect(contactWhatsapp = false) {
    clearInterval(redirectTimer);
    if (contactWhatsapp) {
        window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(`Hola, acabo de terminar mi rutina de ${CURRENT_DAY} y necesito ayuda con un ajuste/dolencia.`)}`, '_blank');
    }
    window.location.href = REDIRECT_URL;
}

contactYesBtn.addEventListener('click', () => handleRedirect(true));
contactNoBtn.addEventListener('click', () => handleRedirect(false));
