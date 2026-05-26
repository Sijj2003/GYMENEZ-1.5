// static/js/utils/ui.js

export function showMessage(message, type = 'success') {
    const messagebox = document.getElementById('message-box');
    if(!messagebox) return;

    messagebox.textContent = message;
    messagebox.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-full text-[10px] font-black tracking-widest uppercase shadow-2xl z-[9999] transition-all duration-400 text-center border backdrop-blur-md w-11/12 max-w-[360px]';
    
    if(type === 'success') {
        messagebox.classList.add('bg-emerald-950/80', 'text-emerald-400', 'border-emerald-500/30');
    } else {
        messagebox.classList.add('bg-red-950/80', 'text-red-400', 'border-red-500/30');
    }
    
    messagebox.style.opacity = '1';
    messagebox.style.transform = 'translate(-50%, 0)';
    
    setTimeout(() => {
        messagebox.style.opacity = '0';
        messagebox.style.transform = 'translate(-50%, -20px)';
    }, 4000);
}

export function showForceLogoutMessage(message, type = 'error') {
    const msgBox = document.getElementById('force-logout-message');
    if(!msgBox) return;
    
    if (message) {
        msgBox.textContent = message;
        msgBox.className = `p-3 mb-4 rounded-lg font-bold text-center text-xs tracking-widest uppercase ${type === 'error' ? 'bg-red-900/30 border border-red-500/50 text-red-400' : 'bg-green-900/30 border border-green-500/50 text-green-400'}`;
        msgBox.classList.remove('hidden');
    } else {
        msgBox.classList.add('hidden'); 
    }
}

export function openModalSafe(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
    }, 10);
}

export function closeModalSafe(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}
