async function loadProfileData() {
    const storedSession = localStorage.getItem('userSession');
    if (!storedSession) {
        window.location.href = '/index.html';
        return;
    }
    // ... aquí pegas toda tu lógica de apiFetchProfileData y renderProfile ...
    console.log("Perfil cargado correctamente");
}
window.onload = loadProfileData;
