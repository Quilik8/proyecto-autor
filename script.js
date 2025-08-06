// =================================================================
// ARCHIVO DE SCRIPT PRINCIPAL PARA EL PROYECTO A.U.T.O.R.
// Versión 3.0 - Unificada y Completa
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
 */
const inicializarApp = async () => {
    // Gestionar la sesión y actualizar el menú
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

    // Cargar contenido dinámico según la página
    await cargarHistorias();
    await cargarDatosDePerfil();
    await cargarDetalleHistoria();
    await cargarContenidoCapitulo(); // <--- Llamada incluida

    // Mostrar la página
    document.body.classList.remove('body-loading');
};

// --- Funciones de carga de datos ---

/**
 * Carga las historias desde Supabase, aplicando un filtro de búsqueda si existe.
 */
const cargarHistorias = async () => {
    const grid = document.querySelector('.featured-stories-grid');
    if (!grid) return;

    // Leer el término de búsqueda de la URL
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    try {
        let consulta = clienteSupabase.from('stories').select('*');

        // Si hay un término de búsqueda, lo aplicamos al título
        if (query) {
            consulta = consulta.ilike('title', `%${query}%`);
        }

        const { data: stories, error } = await consulta;
        if (error) throw error;

        grid.innerHTML = '';

        if (stories.length === 0) {
            grid.innerHTML = '<p>No se encontraron historias con ese término.</p>';
        } else {
            stories.forEach(story => {
                const cardHTML = `
                    <a href="historia.html?id=${story.id}" class="story-card-link">
                        <div class="story-card">
                            <img src="${story.cover_image_url || 'https://placehold.co/300x450/26DDC6/1a1a1a?text=Portada'}" alt="Portada de ${story.title}">
                            <h3 class="card-title">${story.title}</h3>
                            <p class="card-description">${story.synopsis ? story.synopsis.substring(0, 100) + '...' : ''}</p> 
                        </div>
                    </a>`;
                grid.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
    } catch (error) {
        console.error('Error al cargar las historias:', error);
        grid.innerHTML = '<p>No se pudieron cargar las historias.</p>';
    }
};

/**
 * Carga los datos del usuario en la página de perfil.
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
        document.getElementById("profile-joined").textContent = fechaRegistro.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } else {
        window.location.href = 'login.html';
    }
};

/**
 * Carga los detalles de una historia y sus capítulos.
 */
const cargarDetalleHistoria = async () => {
    const storyContainer = document.querySelector('.story-header-container');
    if (!storyContainer) return;

    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id');
    if (!storyId) {
        storyContainer.innerHTML = '<h1>Error: ID de historia no encontrado.</h1>';
        return;
    }

    try {
        const { data: story, error: storyError } = await clienteSupabase
    .from('stories')
    .select(`
        *,
        profiles (
            username
        )
    `)
    .eq('id', storyId)
    .single();

        const { data: chapters, error: chaptersError } = await clienteSupabase.from('chapters').select('*').eq('story_id', storyId).order('chapter_number', { ascending: true });
        if (chaptersError) throw chaptersError;

        document.getElementById('story-title').textContent = story.title;
        document.getElementById('story-author').textContent = `por ${story.profiles.username}`;
        document.getElementById('story-meta').textContent = story.genre || 'Sin género';
        document.getElementById('story-synopsis').textContent = story.synopsis;

        const chapterList = document.getElementById('chapter-list-ul');
        chapterList.innerHTML = '';
        chapters.forEach(chapter => {
            const chapterHTML = `<li><a href="capitulo.html?id=${chapter.id}">${chapter.title}</a></li>`;
            chapterList.insertAdjacentHTML('beforeend', chapterHTML);
        });
    } catch (error) {
        storyContainer.innerHTML = `<h1>Error al cargar la historia.</h1>`;
    }
};

/**
 * Carga el contenido de un capítulo específico.
 */
const cargarContenidoCapitulo = async () => {
    const chapterContainer = document.querySelector('.reading-container');
    if (!chapterContainer) return;

    const params = new URLSearchParams(window.location.search);
    const chapterId = params.get('id');
    if (!chapterId) {
        chapterContainer.innerHTML = '<h1>Error: ID de capítulo no encontrado.</h1>';
        return;
    }

    try {
        const { data: chapter, error } = await clienteSupabase.from('chapters').select('*').eq('id', chapterId).single();
        if (error) throw error;

        document.getElementById('chapter-title-h1').textContent = chapter.title;
        document.getElementById('chapter-content-article').innerHTML = `<p>${chapter.content.replace(/\n/g, '</p><p>')}</p>`;
    } catch (error) {
        chapterContainer.innerHTML = `<h1>Error al cargar el capítulo.</h1>`;
    }
};

// --- Event Listeners Globales ---
if (navLogout) {
    navLogout.addEventListener('click', async (event) => {
        event.preventDefault();
        await clienteSupabase.auth.signOut();
        window.location.href = 'index.html';
    });
}
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
            const { error } = await clienteSupabase.auth.signUp({ email, password, options: { data: { username } } });
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
            const { error } = await clienteSupabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            window.location.href = 'index.html';
        } catch (error) {
            generalError.textContent = "Correo o contraseña incorrectos.";
        }
    });
}

// =================================================================
// SECCIÓN 6: INTERRUPTOR DE TEMA (MODO OSCURO)
// =================================================================
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

// Aplicar el tema guardado al cargar la página
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️'; // Cambiar a ícono de sol
}

// Listener para el clic en el botón
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    let theme = 'light';
    if (document.body.classList.contains('dark-mode')) {
        theme = 'dark';
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
});
// =================================================================
// SECCIÓN 7: BÚSQUEDA GLOBAL
// =================================================================
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

const realizarBusqueda = () => {
    const query = searchInput.value.trim();
    if (query) {
        // Redirigimos a la página de explorar con el término de búsqueda
        window.location.href = `explorar.html?q=${encodeURIComponent(query)}`;
    }
};

// Listener para el clic en el botón
searchButton.addEventListener('click', realizarBusqueda);

// Listener para la tecla "Enter" en el campo de texto
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        realizarBusqueda();
    }
});
// =================================================================
// SECCIÓN 8: LÓGICA PARA LA CREACIÓN DE HISTORIAS
// =================================================================

const createStoryForm = document.querySelector("#create-story-form");

if (createStoryForm) {
    createStoryForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = document.querySelector("#story-title-input").value;
        const synopsis = document.querySelector("#story-synopsis-input").value;
        const genre = document.querySelector("#story-genre-input").value;
        const cover_image_url = document.querySelector("#story-cover-input").value;
        const errorDiv = document.querySelector("#create-story-error");
        errorDiv.textContent = "";

        const { data: { session } } = await clienteSupabase.auth.getSession();
        if (!session) {
            errorDiv.textContent = "Debes iniciar sesión para crear una historia.";
            return;
        }
        const userId = session.user.id;

        try {
            const { data, error } = await clienteSupabase
                .from('stories')
                .insert([{ 
                    title, 
                    synopsis, 
                    genre,
                    cover_image_url,
                    author_id: userId 
                }])
                .select()
                .single();

            if (error) throw error;
            
            window.location.href = `historia.html?id=${data.id}`;

        } catch (error) {
            errorDiv.textContent = "Error al publicar la historia: " + error.message;
        }
    });
}
