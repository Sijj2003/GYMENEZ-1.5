// admin_auth.js - Core System Intelligence
const API_BASE_URL = "https://sijj2003.pythonanywhere.com"; 
const WHATSAPP_NUMBER = "+584148780392"; 

// Generación de Identidad de Terminal
function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

// Notificaciones de Sistema
function showMessage(message, type = 'success') {
    const box = document.getElementById('message-box');
    box.textContent = message;
    box.style.background = type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)';
    box.classList.remove('opacity-0', 'translate-y-[-20px]');
    box.classList.add('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
        box.classList.add('opacity-0', 'translate-y-[-20px]');
    }, 4000);
}

// Control de Acceso
async function handleAdminLogin(event) {
    event.preventDefault(); 
    const btn = document.getElementById('login-button');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-pulse">AUTENTICANDO...</span>`;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin_login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, deviceId: getDeviceId() })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem('adminSession', JSON.stringify(data.admin));
            showMessage("PROTOCOLO DE ACCESO ACEPTADO");
            setTimeout(() => renderAdminDashboard(data.admin), 1200);
        } else {
            showMessage(data.error || "CREDENCIALES NO VÁLIDAS", "error");
            btn.disabled = false;
            btn.textContent = "INGRESAR AL SISTEMA";
        }
    } catch (error) {
        showMessage("FALLO EN LA CONEXIÓN CON EL CORE", "error");
        btn.disabled = false;
        btn.textContent = "REINTENTAR";
    }
}

// Renderizado de Dashboard Nivel Directivo
function renderAdminDashboard(adminData) {
    const loginScreen = document.getElementById('login-screen');
    const dashboardContainer = document.getElementById('dashboard-container');
    
    loginScreen.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    
    dashboardContainer.innerHTML = `
        <header class="w-full px-8 py-5 flex justify-between items-center border-b border-white/5 bg-[#050508]/90 backdrop-blur-2xl sticky top-0 z-50">
            <h1 class="text-xl font-black tracking-tighter uppercase">GYMENEZ <span class="text-indigo-500">CORE</span></h1>
            <div class="flex items-center gap-8">
                <div class="hidden md:flex flex-col items-end">
                    <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">${adminData.name}</span>
                    <span class="text-[8px] text-gray-600 font-bold uppercase">Nivel 1 Access</span>
                </div>
                <button onclick="handleLogout()" class="px-5 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-[9px] font-black uppercase tracking-widest transition-all border border-white/5">Terminar Sesión</button>
            </div>
        </header>

        <main class="max-w-7xl mx-auto p-8 md:p-16">
            <div class="mb-16">
                <p class="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Command Center</p>
                <h2 class="text-5xl font-black tracking-tighter mb-4">Gestión Operativa</h2>
                <div class="h-1 w-20 bg-indigo-500"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${createPanelItem("Usuarios", "Control total de atletas y accesos.", "/apps/admin/admin_users.html", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z")}
                ${createPanelItem("Rutinas", "Motor de diseño de entrenamientos.", "/apps/admin/admin_routines.html", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2")}
                ${createPanelItem("Finanzas", "Suscripciones y flujo de caja.", "/apps/admin/admin_billing.html", "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z")}
                ${createPanelItem("Pulse", "Canal de comunicaciones centralizado.", "/apps/admin/admin_pulse.html", "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z")}
                ${createPanelItem("Staff", "Directorio y roles de entrenadores.", "/apps/admin/admin_trainers.html", "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857")}
                ${createPanelItem("Métricas", "Analítica y logs de rendimiento.", "/apps/admin/metrics.html", "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z")}
            </div>
        </main>
    `;
}

function createPanelItem(title, desc, link, iconPath) {
    return `
        <a href="${link}" class="panel-card p-10 rounded-[40px] flex flex-col gap-8 group">
            <div class="w-14 h-14 rounded-2xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-all text-indigo-400">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="${iconPath}"></path></svg>
            </div>
            <div>
                <h3 class="text-xl font-black uppercase tracking-widest mb-2">${title}</h3>
                <p class="text-gray-500 text-xs font-semibold leading-relaxed">${desc}</p>
            </div>
        </a>
    `;
}

function handleLogout() {
    localStorage.removeItem('adminSession');
    window.location.reload();
}

// Init Protocol
window.onload = function() {
    const splash = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');
    const storedSession = localStorage.getItem('adminSession');

    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            if (storedSession) {
                renderAdminDashboard(JSON.parse(storedSession));
            } else {
                loginScreen.classList.remove('hidden');
                document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);
                document.getElementById('return-to-client-login').addEventListener('click', () => window.location.href = '/');
            }
        }, 1000);
    }, 2800);
};
