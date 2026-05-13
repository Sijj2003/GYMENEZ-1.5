/* static/js/profile.js */

// --- TUS FUNCIONES DE BACKEND (Mantenidas exactamente) ---

async function apiFetchProfileData(userId) {
    try {
        const response = await fetch(`/api/user/profile/${userId}`);
        return await response.json();
    } catch (error) {
        console.error("Error en apiFetchProfileData:", error);
        return { success: false };
    }
}

async function apiFetchMetrics(userId) {
    try {
        const response = await fetch(`/api/user/metrics/${userId}`);
        return await response.json();
    } catch (error) {
        console.error("Error en apiFetchMetrics:", error);
        return { success: false };
    }
}

function renderProfile(profile) {
    if (!profile) return;
    // Mantiene tus nombres de campos de la base de datos
    document.getElementById('display-name').textContent = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'ATLETA GYMENEZ';
    document.getElementById('display-email').textContent = profile.email || '';
    if (profile.photo_url) {
        document.getElementById('user-photo').src = profile.photo_url;
    }
}

function renderMetrics(metrics) {
    if (!metrics) return;
    document.getElementById('stat-weight').textContent = `${metrics.weight || '--'} kg`;
    document.getElementById('stat-height').textContent = `${metrics.height || '--'} cm`;
    
    // Cálculo de IMC si tienes los datos
    if (metrics.weight && metrics.height) {
        const heightMeters = metrics.height / 100;
        const imc = (metrics.weight / (heightMeters * heightMeters)).toFixed(1);
        document.getElementById('stat-imc').textContent = imc;
    }
}

// --- LÓGICA DE CARGA AL INICIAR ---

async function loadProfileData() {
    const storedSession = localStorage.getItem('userSession');
    if (!storedSession) {
        window.location.href = '../../index.html';
        return;
    }
    
    try {
        const userSession = JSON.parse(storedSession);
        const userId = userSession._id || userSession.id;

        // Ejecución en paralelo como en tu original
        const [profileRes, metricsRes] = await Promise.all([
            apiFetchProfileData(userId),
            apiFetchMetrics(userId)
        ]);

        if (profileRes.success) renderProfile(profileRes.profile);
        if (metricsRes.success) renderMetrics(metricsRes.metrics);

        // Control de visibilidad
        document.getElementById('profile-content').classList.remove('hidden');
        document.getElementById('loading-spinner').classList.add('hidden');

    } catch (error) {
        console.error("Error fatal en la carga:", error);
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.innerHTML = '<p class="text-red-500 font-black">❌ ERROR DE CONEXIÓN</p>';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', loadProfileData);
