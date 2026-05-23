// static/js/workout.js - GYMENEZ TACTICAL UI

// 🚀 DETECTOR INTELIGENTE DE ENTORNO PERIMETRAL ( workout.js )
const isLocalhost = window.location.hostname === '127.0.0.1' || 
                    window.location.hostname === 'localhost' || 
                    window.location.protocol === 'file:';

const API_BASE_URL = isLocalhost ? 'http://127.0.0.1:5000' : 'https://sijj2003.pythonanywhere.com';
const CONTACT_WHATSAPP = '584148780392'; 
const REDIRECT_URL = 'routines.html'; 
const REDIRECT_TIMEOUT_SECONDS = 25; 

let userId = null;
let userFullName = null; 
let routineExercises = []; 
let redirectTimer = null; 
let neuralTimerInterval = null;

// =======================================================
// 🛡️ FUNCIÓN DE SEGURIDAD: OBTENER TOKEN
// =======================================================
function getBearerToken() {
    const token = localStorage.getItem('gymen_auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// === DINAMISMO POR URL ===
const urlParams = new URLSearchParams(window.location.search);
const urlDay = urlParams.get('day');
const CURRENT_DAY = urlDay ? urlDay.charAt(0).toUpperCase() + urlDay.slice(1).toLowerCase() : 'Lunes';

const messagebox = document.getElementById('message-box');
const loadingSpinner = document.getElementById('loading-spinner');
const exercisesContainer = document.getElementById('exercises-container');
const noDataMessage = document.getElementById('no-data-message');
const dayTitle = document.getElementById('day-title');
const finishRoutineContainer = document.getElementById('finish-routine-container');
const finishRoutineBtn = document.getElementById('finish-routine-btn');
const finishScreen = document.getElementById('finish-screen');

document.title = `Protocolo ${CURRENT_DAY} | GYMENEZ`;
if (dayTitle) dayTitle.textContent = `${CURRENT_DAY}`;

// =======================================================
// 🎬 MODAL DE REPRODUCTOR NATIVO (YOUTUBE PARSER) 
// =======================================================
const videoModal = document.getElementById('video-modal');
const videoIframe = document.getElementById('video-iframe');
const videoTitle = document.getElementById('video-title');

function getCleanYouTubeEmbed(url) {
    try {
        const urlObj = new URL(url);
        let videoId = null;
        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname === '/watch') videoId = urlObj.searchParams.get('v');
            else if (urlObj.pathname.startsWith('/embed/')) videoId = urlObj.pathname.split('/')[2];
            else if (urlObj.pathname.startsWith('/v/')) videoId = urlObj.pathname.split('/')[2];
            else if (urlObj.pathname.startsWith('/shorts/')) videoId = urlObj.pathname.split('/')[2]; 
        } else if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        }
        if (videoId && videoId.length >= 10) return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3`;
    } catch (e) {
        console.warn("URL Parse Fallback");
    }
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&modestbranding=1&rel=0`;
    return url;
}

window.openTutorial = async (exerciseName) => {
    try {
        showMessage(`Buscando telemetría...`, 'success');
        const res = await fetch(`${API_BASE_URL}/api/exercises/link_tutorial/${encodeURIComponent(exerciseName)}`, { headers: getBearerToken() });
        const data = await res.json();
        
        if (data.success && data.tutorialLink) {
            const cleanUrl = getCleanYouTubeEmbed(data.tutorialLink);
            if (videoTitle) videoTitle.textContent = exerciseName;
            if (videoModal) videoModal.classList.remove('hidden');
            setTimeout(() => {
                videoModal.classList.remove('opacity-0');
                if (videoIframe) {
                    videoIframe.src = cleanUrl;
                    setTimeout(() => videoIframe.classList.remove('opacity-0'), 800);
                }
            }, 50);
        } else {
            showMessage('Material audiovisual no disponible.', 'error');
        }
    } catch(e) { showMessage('Fallo de conexión.', 'error'); }
};

const closeVideoBtn = document.getElementById('close-video-btn');
if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', () => {
        if (videoModal) videoModal.classList.add('opacity-0');
        setTimeout(() => {
            if (videoModal) videoModal.classList.add('hidden');
            if (videoIframe) {
                videoIframe.src = ""; 
                videoIframe.classList.add('opacity-0');
            }
        }, 300);
    });
}

// =======================================================
// 🧩 SISTEMA DE INTERFAZ Y REPRODUCTOR MULTI-SET MATRICIAL 🧩
// =======================================================

function showMessage(message, type = 'success') {
    if (!messagebox) return;
    messagebox.textContent = message;
    messagebox.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase shadow-2xl z-[9999] transition-all duration-300 text-center border border-white/10 w-11/12 max-w-[350px]';
    messagebox.classList.add(type === 'success' ? 'bg-emerald-600' : 'bg-red-600', 'text-white');
    messagebox.style.opacity = '1';
    messagebox.style.transform = 'translate(-50%, 0)';
    setTimeout(() => {
        messagebox.style.opacity = '0';
        messagebox.style.transform = 'translate(-50%, -20px)';
    }, 3000);
}

function renderExercises(exercises) {
    if (!exercisesContainer) return;
    exercisesContainer.innerHTML = ''; 
    if (finishRoutineContainer) finishRoutineContainer.classList.add('hidden'); 
    routineExercises = exercises; 
    
    if (exercises.length === 0) {
        if (noDataMessage) noDataMessage.classList.remove('hidden');
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        return;
    }

    if (noDataMessage) noDataMessage.classList.add('hidden');
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (finishRoutineContainer) finishRoutineContainer.classList.remove('hidden'); 

    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'glass-item-card p-5 md:p-8 rounded-xl md:rounded-2xl flex flex-col gap-4';
        const cardId = exercise.exerciseName.replace(/\s/g, '-');
        
        const totalSets = parseInt(exercise.sets) || 1;
        if (!exercise.sets_data) {
            exercise.sets_data = Array.from({ length: totalSets }, (_, i) => ({
                set_num: i + 1,
                weight: (exercise.weight && exercise.weight !== 'LIBRE') ? parseFloat(exercise.weight) : 0,
                reps: parseInt(exercise.reps) || 10,
                rir: 2,
                completed: false
            }));
        }

        let protectionBadge = '';
        if (exercise.is_substituted) {
            protectionBadge = `
                <div class="w-full bg-red-500/10 border border-red-500/30 p-3 rounded-xl mb-2 flex items-start gap-3 fade-in-up">
                    <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <div>
                        <p class="text-[9px] font-black text-red-400 uppercase tracking-widest">Escudo Articular Activo</p>
                        <p class="text-[10px] text-gray-400 mt-1">Sustituimos <span class="text-white font-bold">${exercise.original_exercise}</span> para aislar la tensión de tu lesión registrada.</p>
                    </div>
                </div>
            `;
        }

        let setsRowsHTML = `
            <div class="w-full space-y-2 mt-2">
                <div class="grid grid-cols-12 gap-2 text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 mb-1 text-center">
                    <div class="col-span-2 text-left">SERIE</div>
                    <div class="col-span-3">PESO (KG)</div>
                    <div class="col-span-3">REPS</div>
                    <div class="col-span-2">RIR</div>
                    <div class="col-span-2">ESTADO</div>
                </div>
        `;

        exercise.sets_data.forEach(s => {
            const rowId = `${cardId}-set-${s.set_num}`;
            setsRowsHTML += `
                <div id="row-${rowId}" class="grid grid-cols-12 gap-2 items-center bg-black/40 p-2 md:p-3 rounded-xl border border-white/5 transition-all duration-300 text-center">
                    <span class="col-span-2 text-[10px] font-black text-gray-400 uppercase tracking-wider text-left pl-1">S${s.set_num}</span>
                    <div class="col-span-3">
                        <input type="number" id="w-${rowId}" value="${s.weight}" class="w-full bg-black/60 border border-white/10 rounded-lg text-white text-xs text-center py-2 focus:border-[#FFC300] outline-none font-bold select-all" placeholder="0">
                    </div>
                    <div class="col-span-3">
                        <input type="number" id="r-${rowId}" value="${s.reps}" class="w-full bg-black/60 border border-white/10 rounded-lg text-white text-xs text-center py-2 focus:border-[#FFC300] outline-none font-bold select-all" placeholder="0">
                    </div>
                    <div class="col-span-2">
                        <input type="number" id="rir-${rowId}" value="${s.rir}" min="0" max="4" class="w-full bg-black/60 border border-white/10 rounded-lg text-white text-xs text-center py-2 focus:border-[#FFC300] outline-none font-bold" placeholder="2">
                    </div>
                    <div class="col-span-2 flex justify-center">
                        <button id="btn-${rowId}" onclick="window.confirmSetData('${exercise.exerciseName.replace(/'/g, "\\'")}', ${s.set_num})" class="w-full max-w-[42px] h-8 rounded-lg bg-white/5 text-gray-400 hover:text-white flex items-center justify-center transition font-black text-xs">
                            ✓
                        </button>
                    </div>
                </div>
            `;
        });
        setsRowsHTML += `</div>`;
        
        card.innerHTML = `
            <div class="w-full"> 
                ${protectionBadge}
                <div class="flex justify-between items-start gap-2 mb-1">
                    <h3 class="text-lg md:text-2xl font-black text-white uppercase tracking-tighter drop-shadow-md break-words pr-2">${exercise.exerciseName}</h3>
                    <button onclick="window.openTutorial('${exercise.exerciseName.replace(/'/g, "\\'")}')" class="flex items-center justify-center p-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition group flex-shrink-0">
                        <svg class="w-4 h-4 group-hover:text-[#FFC300] transition" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5v13L16 10 4.5 3.5z"/></svg>
                    </button>
                </div>
                <div class="flex gap-4 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2 pl-0.5">
                    <p>Sets Plan: <span class="text-white">${exercise.sets || '-'}</span></p>
                    <p>Reps Plan: <span class="text-white">${exercise.reps || '-'}</span></p>
                    <p>Peso Plan: <span class="text-white">${exercise.weight || 'LIBRE'}</span></p>
                </div>
                ${setsRowsHTML}
            </div>
        `;
        exercisesContainer.appendChild(card);
        
        exercise.sets_data.forEach(s => {
            if (s.completed) updateSetRowUI(cardId, s.set_num, true);
        });
    });
    
    updateFinishButtonState();
}

function updateSetRowUI(cardId, setNum, isCompleted) {
    const rowId = `${cardId}-set-${setNum}`;
    const row = document.getElementById(`row-${rowId}`);
    const btn = document.getElementById(`btn-${rowId}`);
    if (!row || !btn) return;

    if (isCompleted) {
        row.classList.add('border-emerald-500/30', 'bg-emerald-500/5');
        btn.className = 'w-full max-w-[42px] h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center transition font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)]';
    } else {
        row.classList.remove('border-emerald-500/30', 'bg-emerald-500/5');
        btn.className = 'w-full max-w-[42px] h-8 rounded-lg bg-white/5 text-gray-400 hover:text-white flex items-center justify-center transition font-black text-xs';
    }
}

function updateFinishButtonState() {
    if (!finishRoutineBtn) return;
    const allSetsCompleted = routineExercises.length > 0 && routineExercises.every(e => 
        e.sets_data && e.sets_data.every(s => s.completed)
    );
    finishRoutineBtn.disabled = !allSetsCompleted;
    finishRoutineBtn.className = `w-full md:w-2/3 py-4 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-sm tracking-[0.2em] font-black transition duration-300 uppercase shadow-2xl ${allSetsCompleted ? 'bg-[#FFC300] hover:bg-yellow-400 text-black shadow-[0_0_30px_rgba(255,195,0,0.3)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/10'}`;
}

// =======================================================
// ⏱️ MOTOR DEL CRONÓMETRO NEURONAL (SND INTELLIGENCE + LÍMITES LÓGICOS)
// =======================================================
let currentRestSeconds = 0;
let totalRestSeconds = 0;

window.confirmSetData = (exerciseName, setNum) => {
    const exercise = routineExercises.find(e => e.exerciseName === exerciseName);
    if (!exercise) return;

    const cardId = exerciseName.replace(/\s/g, '-');
    const rowId = `${cardId}-set-${setNum}`;
    
    let actualWeight = parseFloat(document.getElementById(`w-${rowId}`).value) || 0;
    let actualReps = parseInt(document.getElementById(`r-${rowId}`).value) || 0;
    let actualRir = parseInt(document.getElementById(`rir-${rowId}`).value) || 0;

    // 🛡️ BARRERAS DE SEGURIDAD ANALÍTICA (ANTI-CIFRAS DEMENCIALES)
    if (actualWeight < 0) actualWeight = 0;
    if (actualWeight > 1000) { 
        actualWeight = 1000; 
        showMessage("Peso ajustado al límite (Máx 1,000 KG)", "error"); 
    }

    if (actualReps < 0) actualReps = 0;
    if (actualReps > 100) { 
        actualReps = 100; 
        showMessage("Repeticiones ajustadas al límite (Máx 100)", "error"); 
    }

    if (actualRir < 0) actualRir = 0;
    if (actualRir > 4) { 
        actualRir = 4; 
        showMessage("RIR ajustado al rango analítico (0 a 4)", "error"); 
    }

    // Actualizar visualmente las celdas limpiando errores de tipeo
    document.getElementById(`w-${rowId}`).value = actualWeight;
    document.getElementById(`r-${rowId}`).value = actualReps;
    document.getElementById(`rir-${rowId}`).value = actualRir;

    const setIdx = setNum - 1;
    const sData = exercise.sets_data[setIdx];

    sData.completed = !sData.completed;
    sData.weight = actualWeight;
    sData.reps = actualReps;
    sData.rir = actualRir;

    updateSetRowUI(cardId, setNum, sData.completed);
    updateFinishButtonState();

    if (sData.completed) {
        let I_rel = 1.0278 - (0.0278 * (actualReps + actualRir));
        if (I_rel > 1.0) I_rel = 1.0;
        if (I_rel < 0.4) I_rel = 0.4;

        const T_c = exercise.is_substituted ? 1.0 : 1.5; 
        const P_f = 1 / (actualRir + 1); 
        const SND = (I_rel * T_c) + P_f;
        
        let calculatedRestTime = Math.round(60 + (SND * 60));
        if (calculatedRestTime < 60) calculatedRestTime = 60;
        if (calculatedRestTime > 300) calculatedRestTime = 300; 

        startNeuralTimer(calculatedRestTime);
    }
};

function startNeuralTimer(seconds) {
    const overlay = document.getElementById('neural-timer-overlay');
    const display = document.getElementById('timer-display');
    const circle = document.getElementById('timer-progress');
    
    if (!overlay || !display || !circle) return;

    if (neuralTimerInterval) clearInterval(neuralTimerInterval);

    totalRestSeconds = seconds;
    currentRestSeconds = seconds;
    
    overlay.classList.remove('translate-y-full');
    updateTimerUI();

    neuralTimerInterval = setInterval(() => {
        currentRestSeconds--;
        updateTimerUI();

        if (currentRestSeconds <= 0) {
            endNeuralTimer();
            try { navigator.vibrate([200, 100, 200]); } catch(e){}
        }
    }, 1000);
}

function updateTimerUI() {
    const display = document.getElementById('timer-display');
    const circle = document.getElementById('timer-progress');
    if (!display || !circle) return;
    
    const minutes = Math.floor(currentRestSeconds / 60);
    const secs = currentRestSeconds % 60;
    display.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const dashoffset = 427 - (427 * (currentRestSeconds / totalRestSeconds));
    circle.style.strokeDashoffset = dashoffset;
}

function endNeuralTimer() {
    clearInterval(neuralTimerInterval);
    const overlay = document.getElementById('neural-timer-overlay');
    if (overlay) overlay.classList.add('translate-y-full');
}

const addTimeBtn = document.getElementById('timer-add-btn');
if(addTimeBtn) {
    addTimeBtn.addEventListener('click', () => {
        currentRestSeconds += 30;
        totalRestSeconds += 30;
        updateTimerUI();
    });
}

const skipTimeBtn = document.getElementById('timer-skip-btn');
const minimizeTimeBtn = document.getElementById('timer-minimize-btn');
if(skipTimeBtn) skipTimeBtn.addEventListener('click', endNeuralTimer);
if(minimizeTimeBtn) minimizeTimeBtn.addEventListener('click', endNeuralTimer);

// =======================================================
// 🚀 INICIALIZACIÓN (Carga de Rutina de Firebase)
// =======================================================
async function loadRoutine() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/routines/today/${CURRENT_DAY}`, { headers: getBearerToken() });
        const data = await response.json();
        
        if (data.success && data.routines.length > 0 && data.routines[0].exercises) {
            if (data.routines[0].is_deload) {
                showMessage("ALERTA ACWR: Riesgo de lesión alto. Fase de Descarga Activada.", "error");
                if (dayTitle) dayTitle.innerHTML = `${CURRENT_DAY} <span class="block text-xl text-red-500 mt-2 tracking-widest">(DELOAD)</span>`;
            }
            renderExercises(data.routines[0].exercises);
        } else {
            if (loadingSpinner) loadingSpinner.classList.add('hidden');
            if (noDataMessage) noDataMessage.classList.remove('hidden');
        }
    } catch (e) {
        if (loadingSpinner) loadingSpinner.innerHTML = `<p class="text-red-500 font-bold uppercase tracking-widest text-[10px]">Error de Red.</p>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('userSession'));
    if (!session) { window.location.href = '/apps/start/login.html'; return; }
    userId = session._id || session.id;
    userFullName = `${session.name || ''} ${session.last_name || ''}`.trim() || userId;
    loadRoutine();
});

// =======================================================
// 🏁 EVENTOS DE FINALIZACIÓN Y ENCUESTA DETALLADA
// =======================================================
if (finishRoutineBtn) {
    finishRoutineBtn.addEventListener('click', () => {
        const survey = document.getElementById('survey-container');
        const msg = document.getElementById('finish-message');
        
        if (finishScreen) {
            finishScreen.classList.remove('hidden');
            setTimeout(() => finishScreen.classList.remove('opacity-0'), 50);
        }
        
        const audio = document.getElementById('fireworks-audio');
        if(audio) audio.play().catch(()=>{});
        
        const end = Date.now() + 2500;
        (function frame() {
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFC300', '#ffffff', '#333333'] });
                confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFC300', '#ffffff', '#333333'] });
            }
            if (Date.now() < end) requestAnimationFrame(frame);
            else {
                if (msg) msg.style.opacity = 0;
                setTimeout(() => {
                    if (msg) msg.classList.add('hidden');
                    if (survey) {
                        survey.classList.remove('hidden');
                        setTimeout(() => survey.classList.add('survey-visible'), 50);
                    }
                }, 500);
            }
        }());
    });
}

document.querySelectorAll('input[name="sintio-dolor"]').forEach(r => r.addEventListener('change', (e) => {
    const details = document.getElementById('dolor-details');
    if (details) details.classList.toggle('hidden', e.target.value !== 'si');
}));

document.querySelectorAll('input[name="tipo-dolor"]').forEach(r => r.addEventListener('change', (e) => {
    const otroContainer = document.getElementById('otro-dolor-container');
    if (otroContainer) otroContainer.classList.toggle('hidden', e.target.value !== 'otro');
}));

const surveyForm = document.getElementById('routine-survey-form');
if (surveyForm) {
    surveyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rpeSesion = document.getElementById('costo-rutina').value;
        const sintioDolor = document.querySelector('input[name="sintio-dolor"]:checked').value === 'si';
        const zonaDolor = document.getElementById('zona-dolor') ? document.getElementById('zona-dolor').value : '';
        const tipoDolor = document.querySelector('input[name="tipo-dolor"]:checked') ? document.querySelector('input[name="tipo-dolor"]:checked').value : '';
        
        const ejerciciosCompletados = [];
        routineExercises.forEach(ex => {
            if (ex.sets_data) {
                ex.sets_data.forEach(s => {
                    if (s.completed) {
                        ejerciciosCompletados.push({
                            name: ex.original_exercise || ex.exerciseName, 
                            weight: s.weight,
                            reps: s.reps,
                            rir: s.rir
                        });
                    }
                });
            }
        });

        const payload = {
            routine_name: document.getElementById('day-title').textContent,
            rpe: parseInt(rpeSesion),
            sintio_dolor: sintioDolor,
            detalles_dolor: sintioDolor ? { zona: zonaDolor, tipo: tipoDolor } : {},
            exercises_data: ejerciciosCompletados 
        };

        try {
            await fetch(`${API_BASE_URL}/api/journal/save_session`, {
                method: 'POST',
                headers: {
                    ...getBearerToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            showModalContacto();
        } catch(err) { showMessage("Error al guardar la bitácora en la bóveda.", "error"); }
    });
}

const skipLink = document.getElementById('skip-survey-link');
if (skipLink) skipLink.addEventListener('click', (e) => { e.preventDefault(); showModalContacto(); });

function showModalContacto() {
    const survey = document.getElementById('survey-container');
    const contact = document.getElementById('contact-modal');
    if (survey) survey.classList.remove('survey-visible');
    setTimeout(() => {
        if (survey) survey.classList.add('hidden');
        if (contact) {
            contact.classList.remove('hidden');
            setTimeout(() => contact.classList.add('survey-visible'), 50);
        }
        startRedirectTimer();
    }, 500);
}

function startRedirectTimer() {
    let count = REDIRECT_TIMEOUT_SECONDS;
    const tc = document.getElementById('timer-count');
    if (tc) tc.textContent = count;
    redirectTimer = setInterval(() => {
        count--;
        if (tc) tc.textContent = count;
        if (count <= 0) handleRedirect();
    }, 1000);
}

function handleRedirect(contactWhatsapp = false) {
    clearInterval(redirectTimer);
    if (contactWhatsapp) window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(`Reporte de Sistema: Acabo de terminar mi sesión de ${CURRENT_DAY} y solicito revisión técnica.`)}`, '_blank');
    if (finishScreen) finishScreen.classList.add('opacity-0');
    setTimeout(() => { window.location.href = REDIRECT_URL; }, 700);
}

const contactYesBtn = document.getElementById('contact-yes-btn');
if (contactYesBtn) contactYesBtn.addEventListener('click', () => handleRedirect(true));

const contactNoBtn = document.getElementById('contact-no-btn');
if (contactNoBtn) contactNoBtn.addEventListener('click', () => handleRedirect(false));
