export const configurarMenuHamburguesa = () => {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector("nav");
    if (!hamburger || !navMenu) return;
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });
};

export const configurarInterruptorDeTema = () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    const actualizarIcono = () => {
        const esModoOscuro = document.documentElement.classList.contains('dark-mode');
        themeToggle.textContent = esModoOscuro ? '☀️' : '🌙';
    };
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }
    actualizarIcono();
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-mode');
        const nuevoTema = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', nuevoTema);
        actualizarIcono();
    });
};

export const configurarBarraDeBusqueda = () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    if (!searchInput || !searchButton) return;
    const realizarBusqueda = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `explorar.html?q=${encodeURIComponent(query)}`;
        }
    };
    searchButton.addEventListener('click', realizarBusqueda);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') realizarBusqueda();
    });
};