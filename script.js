// =================================================================
// ARCHIVO DE SCRIPT PRINCIPAL PARA EL PROYECTO A.U.T.O.R.
// Versión 6.0 - Arquitectura de Ejecución por Página
// =================================================================


// =================================================================
// SECCIÓN 1: CONFIGURACIÓN Y FUNCIONES GLOBALES
// =================================================================

const SUPABASE_URL = "https://dyjuvsqghhjtgzbspglz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5anV2c3FnaGhqdGd6YnNwZ2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzQwNjksImV4cCI6MjA2ODkxMDA2OX0.FmhuMYeYf4wuJtuwz6XX_ZI3_AORepwp3_bTXRM5c2Y";
const clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funciones que se ejecutan en TODAS las páginas
const ejecutarScriptsGlobales = async () => {
    configurarMenuHamburguesa();
    configurarInterruptorDeTema();
    configurarBarraDeBusqueda();
    await gestionarEstadoDeSesion(); // Esencial para la barra de navegación
    configurarBotonDeLogout();
};


// =================================================================
// SECCIÓN 2: GESTIÓN DE AUTENTICACIÓN Y SESIÓN
// =================================================================

const gestionarEstadoDeSesion = async () => {
    // Obtenemos todos los elementos primero
    const navElement = document.querySelector('nav');
    const navLogin = document.querySelector("#nav-login");
    const navRegistro = document.querySelector("#nav-registro");
    const navProfile = document.querySelector("#nav-profile");
    const navLogout = document.querySelector("#nav-logout");

    // Obtenemos la sesión del usuario
    const { data: { session } } = await clienteSupabase.auth.getSession();

    // 1. Preparamos los botones correctos quitando la clase 'hidden'.
    //    Todo esto ocurre mientras la barra de navegación es invisible (opacity: 0).
    if (session) {
        navProfile?.classList.remove('hidden');
        navLogout?.classList.remove('hidden');
    } else {
        navLogin?.classList.remove('hidden');
        navRegistro?.classList.remove('hidden');
    }

    // 2. Una vez que todo está en su sitio, hacemos visible la barra de navegación.
    //    Esto revela la barra ya en su estado final y correcto.
    navElement?.classList.remove('nav-loading');
};

const configurarBotonDeLogout = () => {
    const navLogout = document.querySelector("#nav-logout");
    if (!navLogout) return;
    navLogout.addEventListener('click', async (event) => {
        event.preventDefault();
        await clienteSupabase.auth.signOut();
        window.location.href = 'index.html';
    });
};


// =================================================================
// SECCIÓN 3: COMPONENTES GLOBALES DE LA INTERFAZ (UI)
// =================================================================

const configurarMenuHamburguesa = () => {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector("nav");
    if (!hamburger || !navMenu) return;
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });
};

const configurarInterruptorDeTema = () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Función para actualizar el ícono basado en el tema actual
    const actualizarIcono = () => {
        const esModoOscuro = document.documentElement.classList.contains('dark-mode');
        themeToggle.textContent = esModoOscuro ? '☀️' : '🌙';
    };

    // Al cargar la página, establece el tema desde localStorage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }
    
    // Actualiza el ícono inmediatamente después de establecer el tema
    actualizarIcono();

    // Cuando se hace clic en el botón
    themeToggle.addEventListener('click', () => {
        // Invierte el estado actual
        document.documentElement.classList.toggle('dark-mode');
        
        // Determina cuál es el nuevo tema
        const nuevoTema = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
        
        // Guarda el nuevo tema en localStorage
        localStorage.setItem('theme', nuevoTema);
        
        // Actualiza el ícono para que refleje el nuevo estado
        actualizarIcono();
    });
};

const configurarBarraDeBusqueda = () => {
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


// =================================================================
// SECCIÓN 4: LÓGICA ESPECÍFICA POR PÁGINA
// =================================================================

// --- Lógica para páginas de registro y login ---
const inicializarPaginasDeFormulario = () => {
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
};

// --- Lógica para páginas que muestran historias (index, explorar) ---
const inicializarPaginasDeHistorias = async () => {
    const grid = document.querySelector('.featured-stories-grid');
    if (!grid) return;
    
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    try {
        let consulta = clienteSupabase.from('stories').select('*');
        if (query) {
            consulta = consulta.ilike('title', `%${query}%`);
        }
        const { data: stories, error } = await consulta;
        if (error) throw error;
        grid.innerHTML = '';
        if (stories.length === 0) {
            grid.innerHTML = '<p>No se encontraron historias que coincidan con la búsqueda.</p>';
        } else {
            stories.forEach(story => {
                const cardHTML = `<a href="historia.html?id=${story.id}" class="story-card-link"><div class="story-card"><img src="${story.cover_image_url || 'https://placehold.co/300x450/26DDC6/1a1a1a?text=Portada'}" alt="Portada de ${story.title}"><h3 class="card-title">${story.title}</h3><p class="card-description">${story.synopsis ? story.synopsis.substring(0, 100) + '...' : ''}</p></div></a>`;
                grid.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
    } catch (error) {
        console.error('Error al cargar las historias:', error);
        grid.innerHTML = '<p>No se pudieron cargar las historias.</p>';
    }
};

// --- Lógica para la página de detalle de historia (VERSIÓN CORREGIDA) ---
const inicializarPaginaDetalleHistoria = async () => {
    const storyContainer = document.querySelector('.story-header-container');
    if (!storyContainer) return;

    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id');
    if (!storyId) {
        storyContainer.innerHTML = '<h1>Error: ID de historia no encontrado.</h1>';
        return;
    }

    try {
        // --- PASO 1: Obtener la historia principal ---
        const { data: story, error: storyError } = await clienteSupabase
            .from('stories')
            .select('*, profiles(username)')
            .eq('id', storyId)
            .single();

        // Si hay un error al buscar la historia, nos detenemos.
        if (storyError) throw storyError;

        // --- PASO 2: Obtener los capítulos publicados de esa historia ---
        const { data: chapters, error: chaptersError } = await clienteSupabase
            .from('chapters')
            .select('*')
            .eq('story_id', storyId)
            .eq('status', 'publicado')
            .order('chapter_number', { ascending: true });

        // Si hay un error al buscar los capítulos, nos detenemos.
        if (chaptersError) throw chaptersError;

        // --- PASO 3: Actualizar la información en la página ---
        document.getElementById('story-title').textContent = story.title;
        document.getElementById('story-author').textContent = `por ${story.profiles.username}`;
        document.getElementById('story-meta').textContent = story.genre || 'Sin género';
        document.getElementById('story-synopsis').textContent = story.synopsis;

        // --- PASO 4: Gestionar la lista de capítulos y el botón ---
        const chapterList = document.getElementById('chapter-list-ul');
        const startReadingBtn = document.querySelector('.story-header-container .cta-button');
        chapterList.innerHTML = ''; // Limpiamos la lista por si acaso.

        if (chapters && chapters.length > 0) {
            // Si SÍ hay capítulos publicados:
            // 1. Rellenamos la lista de capítulos.
            chapters.forEach(chapter => {
                const chapterHTML = `<li><a href="capitulo.html?id=${chapter.id}">${chapter.chapter_number}. ${chapter.title}</a></li>`;
                chapterList.insertAdjacentHTML('beforeend', chapterHTML);
            });

            // 2. Actualizamos el botón para que apunte al PRIMER capítulo.
            startReadingBtn.href = `capitulo.html?id=${chapters[0].id}`;
            startReadingBtn.style.display = 'inline-block'; // Nos aseguramos que sea visible.

        } else {
            // Si NO hay capítulos publicados:
            // 1. Mostramos un mensaje en la lista.
            chapterList.innerHTML = '<li>Aún no hay capítulos publicados para esta historia.</li>';
            // 2. Ocultamos el botón "Empezar a Leer".
            startReadingBtn.style.display = 'none';
        }

    } catch (error) {
        storyContainer.innerHTML = `<h1>Error al cargar la historia.</h1><p>${error.message}</p>`;
    }
};
// --- Lógica para la página de lectura de capítulo ---
const inicializarPaginaDeLectura = async () => {
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
        if (error || !chapter) throw error || new Error('Capítulo no encontrado');
        
        document.getElementById('chapter-title-h1').textContent = chapter.title;
        document.getElementById('chapter-content-article').innerHTML = `<p>${chapter.content.replace(/\n/g, '</p><p>')}</p>`;
    } catch (error) {
        chapterContainer.innerHTML = `<h1>Error al cargar el capítulo.</h1><p>${error.message}</p>`;
    }
};


// --- Lógica para la página de PERFIL (VERSIÓN CORREGIDA Y COMPLETA) ---
const inicializarPaginaDePerfil = async () => {
    const profilePageContainer = document.querySelector('.profile-page-container');
    if (!profilePageContainer) return;

    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    const user = session.user;

    // --- CARGAR DATOS DEL PERFIL (username, bio, avatar) ---
    try {
        const { data: profile, error } = await clienteSupabase
            .from('profiles')
            .select('username, bio, avatar_url') // Consulta corregida, sin 'email'
            .eq('id', user.id)
            .single();
            
        if (error) throw error;

        document.getElementById("profile-username").textContent = profile.username || 'Usuario';
        document.getElementById("profile-email").textContent = user.email;
        document.querySelector(".profile-avatar").src = profile.avatar_url || 'https://placehold.co/150x150/80E9D9/1a1a1a?text=Avatar';
        document.getElementById("profile-bio").textContent = profile.bio || ''; 
    
    } catch (error) {
        console.error('Error cargando los datos del perfil del usuario:', error);
    }

    // --- CARGAR HISTORIAS DEL USUARIO (LÓGICA RESTAURADA) ---
    try {
        const { data: stories, error } = await clienteSupabase
            .from('stories')
            .select('id, title')
            .eq('author_id', user.id);

        if (error) throw error;

        const storiesListDiv = document.getElementById('gestion-stories-list');
        storiesListDiv.innerHTML = ''; // Limpiar antes de añadir
        if (stories.length === 0) {
            storiesListDiv.innerHTML = '<p>Aún no has creado ninguna historia.</p>';
        } else {
            stories.forEach(story => {
                const storyElement = `<div class="management-list-item"><h4>${story.title}</h4><a href="gestionar-historia.html?id=${story.id}" class="cta-button" style="padding: 6px 15px; margin: 0;">Gestionar</a></div>`;
                storiesListDiv.insertAdjacentHTML('beforeend', storyElement);
            });
        }
    } catch (error) {
        console.error('Error cargando las historias del usuario:', error);
    }
    
    // Configurar pestañas (esta parte ya estaba bien)
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));
            const targetTab = document.getElementById(tab.dataset.tab);
            tab.classList.add('active');
            targetTab.classList.add('active');
        });
    });
};

// =================================================================
// CÓDIGO NUEVO Y COMPLETO PARA REEMPLAZAR
// =================================================================

// --- Lógica para las páginas de GESTIÓN de AUTOR (Versión con Indicadores de Borrador) ---
const inicializarPaginasDeGestion = async () => {
    // Para la página de crear historia
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
            try {
                const { data, error } = await clienteSupabase.from('stories').insert([{ title, synopsis, genre, cover_image_url, author_id: session.user.id }]).select().single();
                if (error) throw error;
                window.location.href = `historia.html?id=${data.id}`;
            } catch (error) {
                errorDiv.textContent = "Error al publicar la historia: " + error.message;
            }
        });
    }

    // Para la página de gestionar historia
    const managementContainer = document.querySelector('#management-page-container');
    if (managementContainer) {
        const params = new URLSearchParams(window.location.search);
        const storyId = params.get('id');
        if (!storyId) {
            managementContainer.innerHTML = '<h1>Error: No se encontró el ID de la historia.</h1>';
            return;
        }
        try {
            const { data: story, error: storyError } = await clienteSupabase.from('stories').select('*').eq('id', storyId).single();
            if (storyError) throw storyError;
            const { data: { session } } = await clienteSupabase.auth.getSession();
            if (!session || session.user.id !== story.author_id) {
                managementContainer.innerHTML = '<h1>Acceso Denegado</h1><p>No tienes permiso para gestionar esta historia.</p>';
                return;
            }
            document.getElementById('management-story-title').textContent = `Gestionando: ${story.title}`;
            document.getElementById('manage-title').value = story.title;
            document.getElementById('manage-synopsis').value = story.synopsis;
            const addNewChapterBtn = document.getElementById('add-new-chapter-btn');
            addNewChapterBtn.href = `editar-capitulo.html?story_id=${storyId}`;
            
            const { data: chapters, error: chaptersError } = await clienteSupabase.from('chapters').select('*').eq('story_id', storyId).order('chapter_number', { ascending: true });
            if (chaptersError) throw chaptersError;
            
            const chapterListDiv = document.getElementById('management-chapter-list');
            chapterListDiv.innerHTML = '';
            chapters.forEach(chapter => {
                // *** MODIFICACIÓN 1: Añadir etiqueta de borrador ***
                const statusTag = chapter.status === 'borrador'
                    ? `<span class="status-tag draft">Borrador</span>`
                    : '';
                
                const chapterHTML = `
                    <div class="chapter-management-item">
                        <p>${chapter.chapter_number}. ${chapter.title}${statusTag}</p>
                        <div class="chapter-actions">
                            <a href="editar-capitulo.html?story_id=${storyId}&chapter_id=${chapter.id}">Editar</a>
                            <a href="#" class="delete-chapter-link" data-chapter-id="${chapter.id}" style="color: #e74c3c;">Borrar</a>
                        </div>
                    </div>`;
                chapterListDiv.insertAdjacentHTML('beforeend', chapterHTML);
            });

            // Delegación de eventos para los botones de borrado
            chapterListDiv.addEventListener('click', async (event) => {
                if (event.target && event.target.classList.contains('delete-chapter-link')) {
                    event.preventDefault();
                    const chapterIdToDelete = event.target.dataset.chapterId;
                    const confirmation = confirm('¿Estás seguro de que quieres borrar este capítulo? Esta acción es permanente.');
                    if (confirmation) {
                        try {
                            const { error } = await clienteSupabase.from('chapters').delete().eq('id', chapterIdToDelete);
                            if (error) throw error;
                            event.target.closest('.chapter-management-item').remove();
                            alert('Capítulo borrado con éxito.');
                        } catch (error) {
                            alert(`Error al borrar el capítulo: ${error.message}`);
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error cargando el panel de gestión:', error);
            managementContainer.innerHTML = '<h1>Error al cargar los datos.</h1>';
        }

        const editStoryForm = document.getElementById('edit-story-details-form');
        if (editStoryForm) {
            editStoryForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const title = document.getElementById('manage-title').value;
                const synopsis = document.getElementById('manage-synopsis').value;
                const submitButton = editStoryForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                const params = new URLSearchParams(window.location.search);
                const storyId = params.get('id');
                if (!storyId) {
                    alert('Error: No se pudo encontrar el ID de la historia para guardar.');
                    return;
                }
                submitButton.disabled = true;
                submitButton.textContent = 'Guardando...';
                try {
                    const { error } = await clienteSupabase.from('stories').update({ title: title, synopsis: synopsis }).eq('id', storyId);
                    if (error) throw error;
                    submitButton.textContent = '¡Guardado!';
                    setTimeout(() => {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }, 2000);
                } catch (error) {
                    alert(`Error al guardar los cambios: ${error.message}`);
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            });
        }
    }

    // Para la página de editar capítulo
    const editorLayout = document.querySelector('.editor-layout');
    if (editorLayout) {
        const editorForm = document.getElementById('chapter-editor-form');
        const params = new URLSearchParams(window.location.search);
        const storyId = params.get('story_id');
        const chapterId = params.get('chapter_id');
        if (!storyId) {
            editorLayout.innerHTML = '<h1>Error: Falta el ID de la historia.</h1>';
            return;
        }
        document.getElementById('story-id-input').value = storyId;
        
        const backToManagementLink = document.getElementById('back-to-management-link');
        if (backToManagementLink) {
            backToManagementLink.href = `gestionar-historia.html?id=${storyId}`;
        }

        const addNewChapterBtn = document.getElementById('add-new-chapter-editor-btn');
        if (addNewChapterBtn) {
            addNewChapterBtn.href = `editar-capitulo.html?story_id=${storyId}`;
        }

        try {
            const { data: chapters, error } = await clienteSupabase.from('chapters').select('id, title, chapter_number, status').eq('story_id', storyId).order('chapter_number', { ascending: true });
            if (error) throw error;
            const chapterListDiv = document.getElementById('editor-chapter-list');
            chapterListDiv.innerHTML = '';
            chapters.forEach(chap => {
                const link = document.createElement('a');
                link.href = `editar-capitulo.html?story_id=${storyId}&chapter_id=${chap.id}`;
                
                // *** MODIFICACIÓN 2: Añadir etiqueta de borrador ***
                const statusTag = chap.status === 'borrador'
                    ? `<span class="status-tag draft">Borrador</span>`
                    : '';
                
                link.innerHTML = `${chap.chapter_number}. ${chap.title}${statusTag}`;
                
                if (chap.id === chapterId) {
                    link.classList.add('active-chapter');
                }
                chapterListDiv.appendChild(link);
            });
        } catch (error) {
            console.error('Error cargando la lista de capítulos:', error);
        }

        if (chapterId) {
            document.getElementById('editor-heading').textContent = 'Editando Capítulo';
            try {
                const { data: chapter, error } = await clienteSupabase.from('chapters').select('*').eq('id', chapterId).single();
                if (error) throw error;
                document.getElementById('chapter-title-input').value = chapter.title;
                document.getElementById('chapter-content-input').value = chapter.content;
            } catch (error) {
                editorLayout.innerHTML = `<h1>Error al cargar el capítulo: ${error.message}</h1>`;
            }
        } else {
            document.getElementById('editor-heading').textContent = 'Creando Nuevo Capítulo';
        }
        
        const guardarCapitulo = async (status) => {
            const title = document.getElementById('chapter-title-input').value;
            const content = document.getElementById('chapter-content-input').value;
            const currentStoryId = document.getElementById('story-id-input').value;
            const errorDiv = document.getElementById('editor-error');
            errorDiv.textContent = '';
            try {
                const params = new URLSearchParams(window.location.search);
                const chapterId = params.get('chapter_id');
                if (chapterId) {
                    const { error } = await clienteSupabase.from('chapters').update({ title, content, status: status }).eq('id', chapterId);
                    if (error) throw error;
                    alert(`Capítulo guardado como: ${status}`);
                    // Recargamos para ver el cambio de estado en la lista
                    window.location.reload();
                } else {
                    const { count, error: countError } = await clienteSupabase.from('chapters').select('*', { count: 'exact', head: true }).eq('story_id', currentStoryId);
                    if (countError) throw countError;
                    const newChapterNumber = (count || 0) + 1;
                    const { data: newChapter, error: insertError } = await clienteSupabase.from('chapters').insert({ story_id: currentStoryId, title, content, chapter_number: newChapterNumber, status: status }).select().single();
                    if (insertError) throw insertError;
                    window.location.href = `editar-capitulo.html?story_id=${currentStoryId}&chapter_id=${newChapter.id}`;
                }
            } catch (error) {
                errorDiv.textContent = `Error al guardar: ${error.message}`;
            }
        };

        editorForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await guardarCapitulo('publicado');
});

        const saveDraftBtn = document.getElementById('save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', async () => {
                await guardarCapitulo('borrador');
            });
        }

        const deleteButton = document.getElementById('delete-chapter-btn');
        if (chapterId && deleteButton) {
            deleteButton.style.display = 'inline-block';
            deleteButton.addEventListener('click', async () => {
                const confirmation = confirm('¿Estás seguro de que quieres borrar este capítulo? Esta acción no se puede deshacer.');
                if (confirmation) {
                    try {
                        const { error } = await clienteSupabase.from('chapters').delete().eq('id', chapterId);
                        if (error) throw error;
                        alert('Capítulo borrado con éxito.');
                        window.location.href = `gestionar-historia.html?id=${storyId}`;
                    } catch (error) {
                        alert(`Error al borrar el capítulo: ${error.message}`);
                    }
                }
            });
        } else if (deleteButton) {
            deleteButton.style.display = 'none';
        }
    }
};

// --- Lógica para la página de EDITAR PERFIL ---
const inicializarPaginaEditarPerfil = async () => {
    // 1. Identificar si estamos en la página correcta
    const editProfileForm = document.getElementById('edit-profile-form');
    if (!editProfileForm) return;

    // 2. Elementos del DOM que vamos a necesitar
    const usernameInput = document.getElementById('username-input');
    const bioInput = document.getElementById('bio-input');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInput = document.getElementById('avatar-input');
    const errorDiv = document.getElementById('edit-profile-error');
    const submitButton = editProfileForm.querySelector('button[type="submit"]');

    let newAvatarFile = null; // Variable para guardar el nuevo archivo de avatar

    // 3. Verificar que el usuario haya iniciado sesión y cargar sus datos
    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html'; // Si no hay sesión, lo mandamos a login
        return;
    }
    const user = session.user;

    // Buscamos el perfil del usuario en nuestra tabla 'profiles'
    try {
        const { data: profile, error } = await clienteSupabase
            .from('profiles')
            .select('username, bio, avatar_url')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        // Rellenamos el formulario con los datos encontrados
        if (profile) {
            usernameInput.value = profile.username || '';
            bioInput.value = profile.bio || '';
            if (profile.avatar_url) {
                // Añadimos un timestamp para evitar que el navegador use una imagen antigua de la caché
                avatarPreview.src = profile.avatar_url + `?t=${new Date().getTime()}`;
            }
        }
    } catch (error) {
        errorDiv.textContent = `Error al cargar el perfil: ${error.message}`;
    }
    
    // 4. Lógica para la previsualización del avatar al seleccionarlo
    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            newAvatarFile = file; // Guardamos el archivo para subirlo después
            const reader = new FileReader();
            reader.onload = (e) => {
                // Mostramos la imagen seleccionada inmediatamente
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

// =================================================================
// CÓDIGO NUEVO Y CORRECTO PARA EL GUARDADO DEL PERFIL
// =================================================================
editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = 'Guardando...';
    errorDiv.textContent = '';

    const user = session.user; // Nos aseguramos de tener el objeto de usuario

    try {
        let avatarUrlToSave = null;

        // --- PASO 1: SUBIR EL AVATAR (SI EXISTE) - LÓGICA CORREGIDA ---
if (newAvatarFile) {
    const fileExt = newAvatarFile.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`; // Usamos un nombre de archivo consistente

    // Primero, intentamos actualizar un archivo existente.
    const { data: updateData, error: updateError } = await clienteSupabase.storage
        .from('avatars')
        .update(filePath, newAvatarFile, {
            cacheControl: '3600',
            upsert: false // Importante: NO crear si no existe
        });

    // Si la actualización falla (probablemente porque no había un archivo anterior),
    // entonces procedemos a subir uno nuevo.
    if (updateError) {
        const { data: uploadData, error: uploadError } = await clienteSupabase.storage
            .from('avatars')
            .upload(filePath, newAvatarFile, {
                cacheControl: '3600',
                upsert: false // Doble seguridad: no sobrescribir
            });
        
        if (uploadError) {
            // Si la subida también falla, lanzamos el error.
            throw uploadError;
        }
    }

    // Obtenemos la URL pública (le añadimos un timestamp para evitar problemas de caché)
    const { data: urlData } = clienteSupabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
    avatarUrlToSave = urlData.publicUrl + `?t=${new Date().getTime()}`;
}

        // --- PASO 2: ACTUALIZAR LA AUTENTICACIÓN PRIMERO ---
        // Esto sincroniza la fuente de datos primaria de Supabase
        const { data: updatedUser, error: updateUserError } = await clienteSupabase.auth.updateUser({
            data: { 
                username: usernameInput.value 
                // Aquí podrías añadir más metadatos si quisieras en el futuro
            }
        });
        if (updateUserError) throw updateUserError;


        // --- PASO 3: ACTUALIZAR NUESTRA TABLA PÚBLICA 'profiles' ---
        // Preparamos el objeto con los datos a guardar.
        const profileUpdates = {
            id: user.id,
            username: usernameInput.value,
            bio: bioInput.value,
            id: user.id,
    username: usernameInput.value,
    bio: bioInput.value,
        };

        // Añadimos la URL del avatar solo si se subió uno nuevo.
        if (avatarUrlToSave) {
            profileUpdates.avatar_url = avatarUrlToSave;
        }

        // Usamos .update() porque el perfil ya debe existir gracias al trigger.
        const { error: updateProfileError } = await clienteSupabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id);

        if (updateProfileError) throw updateProfileError;

        // --- PASO 4: ÉXITO ---
        alert('¡Perfil actualizado con éxito!');
        window.location.href = 'perfil.html';

    } catch (error) {
        errorDiv.textContent = `Error al guardar los cambios: ${error.message}`;
        submitButton.disabled = false;
        submitButton.textContent = 'Guardar Cambios';
    }
});

};

// =================================================================
// SECCIÓN 6: PUNTO DE ENTRADA DE LA APLICACIÓN
// =================================================================
document.addEventListener('DOMContentLoaded', async () => {
    await ejecutarScriptsGlobales();

    // Ahora, ejecutamos la lógica específica de la página actual
    inicializarPaginasDeFormulario();
    await inicializarPaginasDeHistorias();
    await inicializarPaginaDetalleHistoria();
    await inicializarPaginaDeLectura();
    await inicializarPaginaDePerfil();
    await inicializarPaginasDeGestion();
    await inicializarPaginaEditarPerfil();
    
    document.body.classList.remove('body-loading');
});