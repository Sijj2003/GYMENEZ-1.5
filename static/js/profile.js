/* static/js/profile.js */

/**
 * Función principal para cargar el perfil
 */
async function loadProfileData() {
    const storedSession = localStorage.getItem('userSession');
    
    // 1. Verificar sesión
    if (!storedSession) {
        window.location.href = '../../index.html';
        return;
    }
    
    try {
        const userSession = JSON.parse(storedSession);
        const userId = userSession._id || userSession.id;

        // 2. Simulación o Petición a API
        // Aquí puedes usar fetch() para traer datos reales de tu base de datos
        // Por ahora usamos los datos de la sesión para renderizar
        renderProfile(userSession);

        // 3. Control de UI
        document.getElementById('profile-content').classList.remove('hidden');
        document.getElementById('loading-spinner').classList.add('hidden');

    } catch (error) {
        console.error("Error al cargar perfil:", error);
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.innerHTML = '<p class="text-red-500 font-black">❌ ERROR AL CARGAR DATOS</p>';
    }
}

/**
 * Función para pintar los datos en el HTML
 */
function renderProfile(user) {
    if (!user) return;
    
    // Nombres y Core
    if (document.getElementById('display-name')) {
        document.getElementById('display-name').textContent = user.nombre || 'Atleta Gymenez';
    }
    if (document.getElementById('display-email')) {
        document.getElementById('display-email').textContent = user.email || '';
    }
    
    // Foto de perfil (si existe)
    if (user.foto && document.getElementById('user-photo')) {
        document.getElementById('user-photo').src = user.foto;
    }

    // Métricas (Valores por defecto si no existen)
    if (document.getElementById('stat-weight')) {
        document.getElementById('stat-weight').textContent = `${user.peso || '--'} kg`;
    }
    if (document.getElementById('stat-height')) {
        document.getElementById('stat-height').textContent = `${user.altura || '--'} cm`;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadProfileData);
