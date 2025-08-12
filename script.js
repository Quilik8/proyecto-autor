// =================================================================
// ARCHIVO DE SCRIPT PRINCIPAL PARA EL PROYECTO A.U.T.O.R.
// Versión 7.0 - Arquitectura Refactorizada y Estable
// =================================================================


// =================================================================
// SECCIÓN 1: CONFIGURACIÓN Y FUNCIONES GLOBALES
// =================================================================

const SUPABASE_URL = "https://dyjuvsqghhjtgzbspglz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5anV2c3FnaGhqdGd6YnNwZ2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzQwNjksImV4cCI6MjA2ODkxMDA2OX0.FmhuMYeYf4wuJtuwz6XX_ZI3_AORepwp3_bTXRM5c2Y";
const clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ejecutarScriptsGlobales = async () => {
    configurarMenuHamburguesa();
    configurarInterruptorDeTema();
    configurarBarraDeBusqueda();
    await gestionarEstadoDeSesion();
    configurarBotonDeLogout();
};


// =================================================================
// SECCIÓN 2: GESTIÓN DE AUTENTICACIÓN Y SESIÓN
// =================================================================

const gestionarEstadoDeSesion = async () => {
    const navElement = document.querySelector('nav');
    const navLogin = document.querySelector("#nav-login");
    const navRegistro = document.querySelector("#nav-registro");
    const navProfile = document.querySelector("#nav-profile");
    const navLogout = document.querySelector("#nav-logout");
    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (session) {
        navProfile?.classList.remove('hidden');
        navLogout?.classList.remove('hidden');
    } else {
        navLogin?.classList.remove('hidden');
        navRegistro?.classList.remove('hidden');
    }
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

// --- Páginas de Formularios de Usuario (login, registro) ---
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

// --- Páginas de Visualización de Historias (index, explorar) ---
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
        grid.innerHTML = '<p>No se pudieron cargar las historias.</p>';
    }
};

// --- Página de Detalle de Historia ---
const inicializarPaginaDetalleHistoria = async () => {
    const storyPage = document.querySelector('[data-page="detalle-historia"]');
    if (!storyPage) return;

    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id');
    if (!storyId) {
        document.querySelector('main').innerHTML = '<h1>Error: ID de historia no encontrado.</h1>';
        return;
    }

    try {
        const { data: story, error: storyError } = await clienteSupabase.from('stories').select('*, profiles(username)').eq('id', storyId).single();
        if (storyError) throw storyError;

        const { data: chapters, error: chaptersError } = await clienteSupabase.from('chapters').select('*').eq('story_id', storyId).eq('status', 'publicado').order('chapter_number', { ascending: true });
        if (chaptersError) throw chaptersError;

        document.getElementById('story-cover-image').src = story.cover_image_url || 'https://placehold.co/300x450/80E9D9/1a1a1a?text=Portada';
        document.getElementById('story-cover-image').alt = `Portada de ${story.title}`;
        document.getElementById('story-title').textContent = story.title;
        document.getElementById('story-author').textContent = `por ${story.profiles.username}`;
        document.getElementById('story-meta').textContent = story.genre || 'Sin género';
        document.getElementById('story-synopsis').textContent = story.synopsis;

        const chapterList = document.getElementById('chapter-list-ul');
        const startReadingBtn = document.querySelector('.info-column .cta-button');
        chapterList.innerHTML = '';

        if (chapters && chapters.length > 0) {
            chapters.forEach(chapter => {
                chapterList.insertAdjacentHTML('beforeend', `<li><a href="capitulo.html?id=${chapter.id}">${chapter.chapter_number}. ${chapter.title}</a></li>`);
            });
            startReadingBtn.href = `capitulo.html?id=${chapters[0].id}`;
            startReadingBtn.style.display = 'inline-block';
        } else {
            chapterList.innerHTML = '<li>Aún no hay capítulos publicados para esta historia.</li>';
            startReadingBtn.style.display = 'none';
        }

    } catch (error) {
        document.querySelector('main').innerHTML = `<h1>Error al cargar la historia.</h1><p>${error.message}</p>`;
    }
};

// --- Página de Lectura de Capítulo ---
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

// --- Página de Perfil de Usuario ---
const inicializarPaginaDePerfil = async () => {
    const profilePageContainer = document.querySelector('.profile-page-container');
    if (!profilePageContainer) return;

    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    const user = session.user;

    try {
        const { data: profile, error: profileError } = await clienteSupabase.from('profiles').select('username, bio, avatar_url, roles').eq('id', user.id).single();
        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        document.getElementById("profile-email").textContent = user.email;
        if (profile) {
            document.getElementById("profile-username").textContent = profile.username || 'Nombre no definido';
            document.getElementById("profile-bio").textContent = profile.bio || 'Biografía no definida.';
            document.querySelector(".profile-avatar").src = profile.avatar_url || 'https://placehold.co/150x150/80E9D9/1a1a1a?text=Avatar';
            
            const rolesContainer = document.getElementById('profile-roles-container');
            rolesContainer.innerHTML = ''; 
            if (profile.roles && profile.roles.length > 0) {
                profile.roles.forEach(role => {
                    const roleTag = document.createElement('span');
                    roleTag.className = 'role-tag';
                    roleTag.textContent = role;
                    rolesContainer.appendChild(roleTag);
                });
            }
        } else {
            document.getElementById("profile-username").textContent = 'Perfil no encontrado';
            document.getElementById("profile-bio").textContent = 'Edita tu perfil para crearlo.';
        }
    } catch (error) {
        console.error("Error al cargar o actualizar el perfil.", error.message);
    }

    try {
        const { data: stories, error: storiesError } = await clienteSupabase.from('stories').select('id, title').eq('author_id', user.id);
        if (storiesError) throw storiesError;

        const storiesListDiv = document.getElementById('gestion-stories-list');
        storiesListDiv.innerHTML = '';
        if (stories && stories.length > 0) {
            stories.forEach(story => {
                storiesListDiv.insertAdjacentHTML('beforeend', `<div class="management-list-item"><h4>${story.title}</h4><a href="gestionar-historia.html?id=${story.id}" class="cta-button" style="padding: 6px 15px; margin: 0;">Gestionar</a></div>`);
            });
        } else {
            storiesListDiv.innerHTML = '<p>Aún no has creado ninguna historia.</p>';
        }
    } catch (error) {
        console.error("Falló la carga de historias.", error.message);
    }
};

// --- Página de Editar Perfil ---
const inicializarPaginaEditarPerfil = async () => {
    const editProfileForm = document.getElementById('edit-profile-form');
    if (!editProfileForm) return;

    const PREDEFINED_ROLES = ['Autor', 'Lector', 'Editor', 'Diseñador', 'Traductor', 'Beta-Reader', 'Crítico'];
    const usernameInput = document.getElementById('username-input');
    const bioInput = document.getElementById('bio-input');
    const rolesContainer = document.getElementById('predefined-roles-container');
    const customRolesInput = document.getElementById('custom-roles-input');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInput = document.getElementById('avatar-input');
    const errorDiv = document.getElementById('edit-profile-error');
    const submitButton = editProfileForm.querySelector('button[type="submit"]');
    let newAvatarFile = null;

    rolesContainer.innerHTML = '';
    PREDEFINED_ROLES.forEach(role => {
        const id = `role-${role.toLowerCase().replace(/\s/g, '-')}`;
        rolesContainer.insertAdjacentHTML('beforeend', `
            <div class="role-checkbox-item">
                <input type="checkbox" id="${id}" name="predefined_roles" value="${role}">
                <label for="${id}">${role}</label>
            </div>
        `);
    });

    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    const user = session.user;

    try {
        const { data: profile, error } = await clienteSupabase.from('profiles').select('username, bio, avatar_url, roles').eq('id', user.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (profile) {
            usernameInput.value = profile.username || '';
            bioInput.value = profile.bio || '';
            avatarPreview.src = profile.avatar_url || 'https://placehold.co/150x150/80E9D9/1a1a1a?text=Avatar';
            if (profile.roles && profile.roles.length > 0) {
                const customRoles = [];
                profile.roles.forEach(role => {
                    const checkbox = document.querySelector(`input[value="${role}"]`);
                    if (checkbox) checkbox.checked = true;
                    else customRoles.push(role);
                });
                customRolesInput.value = customRoles.join(', ');
            }
        }
    } catch (error) {
        errorDiv.textContent = `Error al cargar el perfil: ${error.message}`;
    }

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            newAvatarFile = file;
            const reader = new FileReader();
            reader.onload = (e) => { avatarPreview.src = e.target.result; };
            reader.readAsDataURL(file);
        }
    });

    editProfileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Guardando...';
        errorDiv.textContent = '';
        try {
            const selectedRoles = Array.from(document.querySelectorAll('input[name="predefined_roles"]:checked')).map(cb => cb.value);
            const customRoles = customRolesInput.value.split(',').map(r => r.trim()).filter(r => r);
            const allRoles = [...new Set([...selectedRoles, ...customRoles])];
            const profileUpdates = { username: usernameInput.value, bio: bioInput.value, roles: allRoles };
            if (newAvatarFile) {
                const fileExt = newAvatarFile.name.split('.').pop();
                const filePath = `${user.id}/avatar.${fileExt}`;
                await clienteSupabase.storage.from('avatars').update(filePath, newAvatarFile, { upsert: true });
                const { data: urlData } = clienteSupabase.storage.from('avatars').getPublicUrl(filePath);
                profileUpdates.avatar_url = urlData.publicUrl + `?t=${new Date().getTime()}`;
            }
            const { error: updateError } = await clienteSupabase.from('profiles').update(profileUpdates).eq('id', user.id);
            if (updateError) throw updateError;
            alert('¡Perfil actualizado con éxito!');
            window.location.href = 'perfil.html';
        } catch (error) {
            errorDiv.textContent = `Error al guardar los cambios: ${error.message}`;
            submitButton.disabled = false;
            submitButton.textContent = 'Guardar Cambios';
        }
    });
};

// --- Página de Crear Entrada de Bitácora ---
const inicializarPaginaCrearEntrada = async () => {
    const createEntryForm = document.getElementById('create-entry-form');
    if (!createEntryForm) return;

    const typeApunteRadio = document.getElementById('type-apunte');
    const typeArticuloRadio = document.getElementById('type-articulo');
    const titleFormGroup = document.getElementById('title-form-group');
    const entryTitleInput = document.getElementById('entry-title');
    const entryContentInput = document.getElementById('entry-content');
    const contentLabel = document.getElementById('content-label');
    const errorDiv = document.getElementById('create-entry-error');
    const submitButton = createEntryForm.querySelector('button[type="submit"]');

    const toggleTitleField = () => {
        if (typeArticuloRadio.checked) {
            titleFormGroup.classList.remove('hidden');
            contentLabel.textContent = 'Contenido del Artículo';
        } else {
            titleFormGroup.classList.add('hidden');
            contentLabel.textContent = 'Contenido del Apunte';
        }
    };
    typeApunteRadio.addEventListener('change', toggleTitleField);
    typeArticuloRadio.addEventListener('change', toggleTitleField);

    createEntryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorDiv.textContent = '';
        submitButton.disabled = true;
        submitButton.textContent = 'Publicando...';

        const { data: { session } } = await clienteSupabase.auth.getSession();
        if (!session) {
            errorDiv.textContent = "Debes iniciar sesión para publicar.";
            submitButton.disabled = false;
            submitButton.textContent = 'Publicar Entrada';
            return;
        }

        const type = typeArticuloRadio.checked ? 'articulo' : 'apunte';
        const title = entryTitleInput.value.trim();
        const content = entryContentInput.value.trim();
        
        if (type === 'articulo' && !title) {
            errorDiv.textContent = 'El título es obligatorio para los artículos.';
            submitButton.disabled = false;
            submitButton.textContent = 'Publicar Entrada';
            return;
        }
        if (!content) {
            errorDiv.textContent = 'El contenido no puede estar vacío.';
            submitButton.disabled = false;
            submitButton.textContent = 'Publicar Entrada';
            return;
        }

        try {
            const { error } = await clienteSupabase.from('bitacora').insert({
                author_id: session.user.id,
                type: type,
                title: type === 'articulo' ? title : null,
                content: content
            });
            if (error) throw error;
            alert('¡Entrada publicada con éxito!');
            window.location.href = 'perfil.html';
        } catch (error) {
            errorDiv.textContent = `Error al publicar: ${error.message}`;
            submitButton.disabled = false;
            submitButton.textContent = 'Publicar Entrada';
        }
    });
};

// =================================================================
// SECCIÓN 5: FUNCIONES DE GESTIÓN DE CONTENIDO (REFACTORIZADAS)
// =================================================================

const inicializarCrearHistoria = async () => {
    const createStoryForm = document.getElementById("create-story-form");
    if (!createStoryForm) return;

    const coverInput = document.getElementById('cover-input');
    const coverPreview = document.getElementById('cover-preview');
    const errorDiv = document.getElementById('create-story-error');
    let newCoverFile = null;

    coverInput.addEventListener('change', () => {
        const file = coverInput.files[0];
        if (file) {
            newCoverFile = file;
            const reader = new FileReader();
            reader.onload = (e) => { coverPreview.src = e.target.result; };
            reader.readAsDataURL(file);
        }
    });

    createStoryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        errorDiv.textContent = '';
        const { data: { session } } = await clienteSupabase.auth.getSession();
        if (!session) {
            errorDiv.textContent = "Debes iniciar sesión para crear una historia.";
            return;
        }
        const user = session.user;
        const title = document.querySelector("#story-title-input").value;
        const synopsis = document.querySelector("#story-synopsis-input").value;
        const genre = document.querySelector("#story-genre-input").value;

        if (!title.trim()) {
            errorDiv.textContent = "El título de la historia es obligatorio.";
            return;
        }

        try {
            const { data: newStory, error: insertError } = await clienteSupabase
                .from('stories')
                .insert({ title, synopsis, genre, author_id: user.id })
                .select()
                .single();
            if (insertError) throw insertError;
            
            if (!newCoverFile) {
                 window.location.href = `gestionar-historia.html?id=${newStory.id}`;
                 return;
            }

            const fileExt = newCoverFile.name.split('.').pop();
            const filePath = `${user.id}/${newStory.id}.${fileExt}`;
            const { error: uploadError } = await clienteSupabase.storage.from('covers').upload(filePath, newCoverFile);
            if (uploadError) throw uploadError;

            const { data: urlData } = clienteSupabase.storage.from('covers').getPublicUrl(filePath);
            const { error: updateError } = await clienteSupabase.from('stories').update({ cover_image_url: urlData.publicUrl }).eq('id', newStory.id);
            if (updateError) throw updateError;
            
            window.location.href = `gestionar-historia.html?id=${newStory.id}`;
        } catch (error) {
            errorDiv.textContent = "Error al publicar la historia: " + error.message;
        }
    });
};

const inicializarGestionHistoria = async () => {
    const managementContainer = document.querySelector('#management-page-container');
    if (!managementContainer) return;

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
        document.getElementById('manage-cover-preview').src = story.cover_image_url || 'https://placehold.co/300x450/80E9D9/1a1a1a?text=Portada';
        document.getElementById('add-new-chapter-btn').href = `editar-capitulo.html?story_id=${storyId}`;

        const { data: chapters, error: chaptersError } = await clienteSupabase.from('chapters').select('*').eq('story_id', storyId).order('chapter_number', { ascending: true });
        if (chaptersError) throw chaptersError;

        const chapterCount = chapters.length;
        const publishedCount = chapters.filter(c => c.status === 'publicado').length;
        const totalWords = chapters.reduce((sum, chapter) => (sum + (chapter.content ? chapter.content.trim().split(/\s+/).length : 0)), 0);
        document.getElementById('story-stats-container').innerHTML = `
            <h4>Estadísticas de la Obra</h4>
            <div class="stats-grid">
                <div class="stat-item"><span class="stat-number">${chapterCount}</span><span class="stat-label">Capítulos</span></div>
                <div class="stat-item"><span class="stat-number">${publishedCount}</span><span class="stat-label">Publicados</span></div>
                <div class="stat-item"><span class="stat-number">${totalWords.toLocaleString('es')}</span><span class="stat-label">Palabras</span></div>
            </div>
        `;

        const chapterListDiv = document.getElementById('management-chapter-list');
        chapterListDiv.innerHTML = '';
        chapters.forEach(chapter => {
            const statusTag = chapter.status === 'borrador' ? `<span class="status-tag draft">Borrador</span>` : '';
            chapterListDiv.insertAdjacentHTML('beforeend', `
                <div class="chapter-management-item">
                    <p>${chapter.chapter_number}. ${chapter.title}${statusTag}</p>
                    <div class="chapter-actions">
                        <a href="editar-capitulo.html?story_id=${storyId}&chapter_id=${chapter.id}">Editar</a>
                        <a href="#" class="delete-chapter-link" data-chapter-id="${chapter.id}" style="color: #e74c3c;">Borrar</a>
                    </div>
                </div>`);
        });

    } catch (error) {
        managementContainer.innerHTML = `<h1>Error al cargar los datos de gestión.</h1><p>${error.message}</p>`;
    }
};

const inicializarEditarCapitulo = async () => {
    const editorLayout = document.querySelector('.editor-layout');
    if (!editorLayout) return;

    // ... (El resto de la lógica para editar capítulo, que ya es bastante independiente)
};

// =================================================================
// SECCIÓN 6: PUNTO DE ENTRADA DE LA APLICACIÓN (VERSIÓN LIMPIA)
// =================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Los scripts globales siempre se ejecutan
    await ejecutarScriptsGlobales();

    // 2. Obtenemos la página actual desde el atributo del body
    const currentPage = document.body.dataset.page;

    // 3. Ejecutamos solo el código específico de la página
    switch (currentPage) {
        case 'index':
        case 'explorar':
            await inicializarPaginasDeHistorias();
            break;
        case 'registro':
        case 'login':
            inicializarPaginasDeFormulario();
            break;
        case 'detalle-historia':
            await inicializarPaginaDetalleHistoria();
            break;
        case 'lectura':
            await inicializarPaginaDeLectura();
            break;
        case 'perfil':
            await inicializarPaginaDePerfil();
            break;
        case 'editar-perfil':
            await inicializarPaginaEditarPerfil();
            break;
        case 'crear-entrada':
            await inicializarPaginaCrearEntrada();
            break;
        case 'crear-historia':
            await inicializarCrearHistoria();
            break;
        case 'gestion-historia':
            await inicializarGestionHistoria();
            break;
        case 'editar-capitulo':
            await inicializarEditarCapitulo();
            break;
    }
    
    // 4. Hacemos visible el body cuando todo ha cargado
    document.body.classList.remove('body-loading');
});