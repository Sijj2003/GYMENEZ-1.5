// admin_auth.js - System Core Intelligence
const API_BASE_URL = "https://sijj2003.pythonanywhere.com"; 
const WHATSAPP_NUMBER = "+584148780392"; 

function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

function showMessage(message, type = 'success') {
    const box = document.getElementById('message-box');
    if(!box) return;
    box.textContent = message;
    box.style.background = type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    box.style.color = type === 'success' ? '#10b981' : '#ef4444';
    box.style.borderColor = type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    
    box.classList.remove('opacity-0', 'translate-y-[-20px]');
    box.classList.add('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
        box.classList.add('opacity-0', 'translate-y-[-20px]');
    }, 4000);
}

async function handleAdminLogin(event) {
    event.preventDefault(); 
    const btn = document.getElementById('login-button');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="tracking-[0.8em] animate-pulse">VERIFICANDO...</span>`;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin_login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, deviceId: getDeviceId() })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem('adminSession', JSON.stringify(data.admin));
            showMessage("ACCESO NIVEL 1 CONCEDIDO");
            setTimeout(() => renderAdminDashboard(data.admin), 1500);
        } else {
            showMessage(data.error || "ACCESO DENEGADO", "error");
            btn.disabled = false;
            btn.textContent = "INGRESAR AL SISTEMA";
        }
    } catch (error) {
        showMessage("ERROR DE CONEXIÓN CON EL NÚCLEO", "error");
        btn.disabled = false;
        btn.textContent = "REINTENTAR ACCESO";
    }
}

function renderAdminDashboard(adminData) {
    const loginScreen = document.getElementById('login-screen');
    const dashboardContainer = document.getElementById('dashboard-container');
    
    loginScreen.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    
    dashboardContainer.innerHTML = `
        <header class="w-full px-10 py-6 flex justify-between items-center border-b border-white/5 bg-[#050508]/80 backdrop-blur-3xl sticky top-0 z-50">
            <div class="flex items-center gap-4">
                <div class="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>
                <h1 class="text-lg font-black tracking-tighter uppercase">GYMENEZ <span class="text-indigo-500">CORE</span></h1>
            </div>
            <div class="flex items-center gap-10">
                <div class="text-right">
                    <p class="text-[10px] font-black text-white uppercase tracking-widest">${adminData.name}</p>
                    <p class="text-[8px] text-indigo-400 font-bold uppercase tracking-tighter">System Administrator</p>
                </div>
                <button onclick="handleLogout()" class="px-6 py-2 rounded-full bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-white/10">Cerrar Terminal</button>
            </div>
        </header>

        <main class="max-w-7xl mx-auto p-10 md:p-20">
            <div class="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 class="text-6xl font-black tracking-tighter mb-4 text-white">Consola de <br><span class="text-indigo-500">Gestión.</span></h2>
                    <p class="text-gray-500 text-sm font-medium tracking-wide">Bienvenido al núcleo operativo de GYMENEZ PERFORMANCE.</p>
                </div>
                <div class="px-6 py-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                    <p class="text-[9px] font-black text-gray-500 uppercase mb-1">Status del Sistema</p>
                    <p class="text-xs font-bold text-indigo-400">TODOS LOS MÓDULOS ONLINE</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                ${createPanelItem("Usuarios", "Gestión de atletas, perfiles y estados de cuenta.", "/templates/admin/admin_users.html", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z")}
                ${createPanelItem("Rutinas", "Control de contenido físico y planes base.", "/templates/admin/admin_routines.html", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2")}
                ${createPanelItem("Facturación", "Control de membresías y flujos de pago.", "/templates/admin/admin_billing.html", "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z")}
                ${createPanelItem("Pulse", "Comunicaciones, alertas y soporte.", "/templates/admin/admin_pulse.html", "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z")}
                ${createPanelItem("Staff", "Directorio y accesos de entrenadores.", "/templates/admin/admin_trainers.html", "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857")}
                ${createPanelItem("Métricas", "Analítica global y registros de actividad.", "/templates/admin/metrics.html", "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z")}
            </div>
        </main>
    `;
}

function createPanelItem(title, desc, link, iconPath) {
    return `
        <a href="${link}" class="panel-card p-12 rounded-[48px] flex flex-col gap-8 group">
            <div class="w-16 h-16 rounded-[24px] bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 text-indigo-400">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="${iconPath}"></path></svg>
            </div>
            <div>
                <h3 class="text-xl font-black uppercase tracking-[0.2em] mb-3 text-white group-hover:text-indigo-400 transition-colors">${title}</h3>
                <p class="text-gray-500 text-[11px] font-medium leading-relaxed">${desc}</p>
            </div>
        </a>
    `;
}

function handleLogout() {
    localStorage.removeItem('adminSession');
    window.location.reload();
}

window.onload = function() {
    const splash = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');
    const storedSession = localStorage.getItem('adminSession');

    setTimeout(() => {
        if(splash) {
            splash.style.transition = 'opacity 1s ease-out';
            splash.style.opacity = '0';
        }
        setTimeout(() => {
            if(splash) splash.style.display = 'none';
            if (storedSession) {
                renderAdminDashboard(JSON.parse(storedSession));
            } else {
                loginScreen.classList.remove('hidden');
                document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);
                document.getElementById('return-to-client-login').addEventListener('click', () => window.location.href = '/');
            }
        }, 1000);
    }, 3000);
};
