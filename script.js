// =================================================================
// ARCHIVO DE SCRIPT PRINCIPAL PARA EL PROYECTO A.U.T.O.R.
// Versión 2.1 - Corregido y Final
// =================================================================

// =================================================================
// SECCIÓN 0: INICIALIZACIÓN Y CONFIGURACIÓN DE SUPABASE
// =================================================================
const SUPABASE_URL = "https://dyjuvsqghhjtgzbspglz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5anV2c3FnaGhqdGd6YnNwZ2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzQwNjksImV4cCI6MjA2ODkxMDA2OX0.FmhuMYeYf4wuJtuwz6XX_ZI3_AORepwp3_bTXRM5c2Y";

const clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =================================================================
// SECCIÓN 1: LÓGICA DE LA APLICACIÓN PRINCIPAL
// =================================================================

// Seleccionamos los elementos de navegación una sola vez
const navLogin = document.querySelector("#nav-login");
const navRegistro = document.querySelector("#nav-registro");
const navProfile = document.querySelector("#nav-profile");
const navLogout = document.querySelector("#nav-logout");

/**
 * Función principal que se ejecuta al cargar la página.
 * Gestiona la sesión, la UI y la carga de datos.
 */
const inicializarApp = async () => {
    // 1. Gestionar la sesión y actualizar el menú de navegación
    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (session) {
        navLogin.classList.add('hidden');
        navRegistro.classList.add('hidden');
        navProfile.classList.remove('hidden');
        navLogout.classList.remove('hidden');
    } else {
        navLogin.classList.remove('hidden');
        navRegistro.classList.remove('hidden');
        navProfile.classList.add('hidden');
        navLogout.classList.add('hidden');
    }

    // 2. Cargar contenido dinámico según la página en la que estemos
    await cargarHistorias();
    await cargarDatosDePerfil();
    await cargarDetalleHistoria();

    // 3. Quitar la clase 'loading' para mostrar la página
    document.body.classList.remove('body-loading');
};

// --- Funciones de carga de datos ---

/**
 * Carga las historias desde Supabase y las muestra en la cuadrícula.
 */
const cargarHistorias = async () => {
    const grid = document.querySelector('.featured-stories-grid');
    if (!grid) return;

    try {
        const { data: stories, error } = await clienteSupabase.from('stories').select('*');
        if (error) throw error;

        grid.innerHTML = '';

        stories.forEach(story => {
            const cardHTML = `
                <a href="historia.html?id=${story.id}" class="story-card-link">
                    <div class="story-card">
                        <img src="${story.cover_image_url || 'https://placehold.co/300x450/26DDC6/1a1a1a?text=Portada'}" alt="Portada de ${story.title}">
                        <h3 class="card-title">${story.title}</h3>
                        <p class="card-description">${story.synopsis ? story.synopsis.substring(0, 100) + '...' : ''}</p> 
                    </div>
                </a>
            `;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (error) {
        console.error('Error al cargar las historias:', error);
        grid.innerHTML = '<p>No se pudieron cargar las historias. Inténtalo de nuevo más tarde.</p>';
    }
};

/**
 * Carga los datos del usuario logueado en la página de perfil.
 */
const cargarDatosDePerfil = async () => {
    const profileContainer = document.querySelector('.profile-container');
    if (!profileContainer) return;

    const { data: { session } } = await clienteSupabase.auth.getSession();

    if (session) {
        const user = session.user;
        document.getElementById("profile-username").textContent = user.user_metadata.username || 'No definido';
        document.getElementById("profile-email").textContent = user.email;
        const fechaRegistro = new Date(user.created_at);
        document.getElementById("profile-joined").textContent = fechaRegistro.toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } else {
        window.location.href = 'login.html';
    }
};

/**
 * Carga los detalles de una historia específica y sus capítulos.
 */
const cargarDetalleHistoria = async () => {
    const storyContainer = document.querySelector('.story-header-container');
    if (!storyContainer) return;

    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id');

    if (!storyId) {
        storyContainer.innerHTML = '<h1>Error: No se ha especificado una historia.</h1>';
        return;
    }

    try {
        const { data: story, error: storyError } = await clienteSupabase
            .from('stories').select('*').eq('id', storyId).single();
        if (storyError) throw storyError;

        const { data: chapters, error: chaptersError } = await clienteSupabase
            .from('chapters').select('*').eq('story_id', storyId).order('chapter_number', { ascending: true });
        if (chaptersError) throw chaptersError;

        document.getElementById('story-title').textContent = story.title;
        document.getElementById('story-author').textContent = 'por un autor'; 
        document.getElementById('story-meta').textContent = story.genre || 'Sin género';
        document.getElementById('story-synopsis').textContent = story.synopsis;

        const chapterList = document.getElementById('chapter-list-ul');
        chapterList.innerHTML = '';
        chapters.forEach(chapter => {
            const chapterHTML = `
                <li><a href="capitulo.html?id=${chapter.id}">${chapter.title}</a></li>
            `;
            chapterList.insertAdjacentHTML('beforeend', chapterHTML);
        });

    } catch (error) {
        console.error('Error cargando el detalle de la historia:', error);
        storyContainer.innerHTML = `<h1>Error al cargar la historia.</h1><p>${error.message}</p>`;
    }
};

// --- Event Listeners Globales ---

// Listener para el botón de cerrar sesión
if (navLogout) {
    navLogout.addEventListener('click', async (event) => {
        event.preventDefault();
        await clienteSupabase.auth.signOut();
        window.location.href = 'index.html';
    });
}

// Listener para ejecutar la app cuando el HTML esté listo
document.addEventListener('DOMContentLoaded', inicializarApp);


// =================================================================
// SECCIÓN 2: COMPONENTES DE UI (MENÚ HAMBURGUESA)
// =================================================================
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector("nav");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });
}


// =================================================================
// SECCIÓN 3: LÓGICA DE FORMULARIOS (LOGIN Y REGISTRO)
// =================================================================

const registroForm = document.querySelector("#registro-form");
if (registroForm) {
    registroForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.querySelector("#username").value;
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const generalError = document.querySelector("#general-error");
        generalError.textContent = "";

        try {
            const { error } = await clienteSupabase.auth.signUp({
                email: email, password: password, options: { data: { username: username } }
            });
            if (error) throw error;
            window.location.href = 'confirmacion.html';
        } catch (error) {
            generalError.textContent = "Error en el registro: " + error.message;
        }
    });
}

const loginForm = document.querySelector("#login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.querySelector("#login-email").value;
        const password = document.querySelector("#login-password").value;
        const generalError = document.querySelector("#login-general-error");
        generalError.textContent = "";

        try {
            const { error } = await clienteSupabase.auth.signInWithPassword({
                email: email, password: password,
            });
            if (error) throw error;
            window.location.href = 'index.html';
        } catch (error) {
            generalError.textContent = "Correo o contraseña incorrectos.";
        }
    });
}