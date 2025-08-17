// =================================================================
// ARCHIVO DE SCRIPT PRINCIPAL PARA EL PROYECTO A.U.T.O.R.
// Versión 7.0 - Arquitectura Refactorizada y Estable
// =================================================================


// =================================================================
// SECCIÓN 1: CONFIGURACIÓN Y FUNCIONES GLOBALES
// =================================================================

import { clienteSupabase } from './supabaseClient.js';
import { configurarMenuHamburguesa, configurarInterruptorDeTema, configurarBarraDeBusqueda } from './ui.js';
import { inicializarPaginasDeFormulario } from './pages/authForms.js';
import { inicializarPaginasDeHistorias } from './pages/storyGrid.js';
import { inicializarPaginaDetalleHistoria } from './pages/storyDetail.js';
import { inicializarPaginaDeLectura } from './pages/chapterReader.js';

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
// SECCIÓN 4: LÓGICA ESPECÍFICA POR PÁGINA
// =================================================================


// --- Página de Perfil de Usuario (VERSIÓN FINAL HÍBRIDA) ---
const inicializarPaginaDePerfil = async () => {
    const profilePageContainer = document.querySelector('.profile-page-container');
    if (!profilePageContainer) return;

    // --- PASO 1: Determinar qué perfil mostrar ---
    const params = new URLSearchParams(window.location.search);
    let targetProfileId = params.get('id'); // ID de la URL

    const { data: { session } } = await clienteSupabase.auth.getSession();
    const currentUserId = session ? session.user.id : null;

    // isOwnProfile es true si no hay ID en la URL, o si el ID de la URL coincide con el nuestro.
    const isOwnProfile = !targetProfileId || targetProfileId === currentUserId;

    // Si el usuario intenta ver su propio perfil (sin ID en la URL) pero no tiene sesión, lo mandamos a login.
    if (isOwnProfile && !currentUserId) {
        window.location.href = 'login.html';
        return;
    }
    
    // Si es su propio perfil, nos aseguramos de que el targetProfileId sea el suyo.
    if (isOwnProfile) {
        targetProfileId = currentUserId;
    }

    // --- PASO 2: Cargar la información pública del perfil ---
    try {
        const { data: profile, error } = await clienteSupabase
            .from('profiles')
            .select('*')
            .eq('id', targetProfileId)
            .single();

        if (error) throw error;
        
        document.getElementById("profile-username").textContent = profile.username || 'Usuario desconocido';
        document.getElementById("profile-bio").textContent = profile.bio || 'Sin biografía.';
        document.querySelector(".profile-avatar").src = profile.avatar_url || 'https://placehold.co/150x150/80E9D9/1a1a1a?text=Avatar';
        
        const rolesContainer = document.getElementById('profile-roles-container');
        rolesContainer.innerHTML = ''; 
        if (profile.roles && profile.roles.length > 0) {
            profile.roles.forEach(role => {
                rolesContainer.insertAdjacentHTML('beforeend', `<span class="role-tag">${role}</span>`);
            });
        }
    } catch (error) {
        profilePageContainer.innerHTML = '<h1>Perfil no encontrado</h1><p>El usuario que buscas no existe o ha sido eliminado.</p>';
        return; // Detenemos la ejecución si el perfil no carga
    }

        // --- PASO 3: Configurar la UI y cargar datos adicionales según la vista ---
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Lógica para que las pestañas funcionen
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.tab);
            if (target) {
                target.classList.add('active');
            }
        });
    });

    if (isOwnProfile) {
        // --- VISTA PRIVADA (ES MI PERFIL) ---
        
        // Hacemos visibles los elementos privados
        document.getElementById('edit-profile-btn').classList.remove('hidden');
        document.getElementById('profile-email').classList.remove('hidden');
        document.querySelector('[data-tab="tab-gestion"]').classList.remove('hidden');
        document.querySelector('[data-tab="tab-biblioteca"]').classList.remove('hidden');

        // Forzamos que la pestaña de Gestión sea la activa, revirtiendo el default del HTML.
        document.querySelector('[data-tab="tab-obras"]').classList.remove('active');
        document.getElementById('tab-obras').classList.remove('active');
        document.querySelector('[data-tab="tab-gestion"]').classList.add('active');
        document.getElementById('tab-gestion').classList.add('active');

        document.getElementById('profile-email').textContent = session.user.email;

        // Cargar historias para la pestaña de Gestión
        try {
            const { data: stories, error } = await clienteSupabase
                .from('stories')
                .select('id, title')
                .eq('author_id', currentUserId);
            if (error) throw error;
            
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
            console.error("Falló la carga de historias para gestión:", error.message);
        }

    } else {
        // --- VISTA PÚBLICA (ES EL PERFIL DE OTRO) ---
        document.getElementById('edit-profile-btn').style.display = 'none';
        document.getElementById('profile-email').style.display = 'none';

        // Activar la pestaña "Obras Públicas" por defecto
        document.querySelector('[data-tab="tab-gestion"]').classList.remove('active');
        document.getElementById('tab-gestion').classList.remove('active');
        document.querySelector('[data-tab="tab-obras"]').classList.add('active');
        document.getElementById('tab-obras').classList.add('active');
    }

    // --- PASO 4: Cargar datos públicos para ambas vistas ---

    // Cargar Obras Públicas en la pestaña "Obras"
    const obrasContainer = document.getElementById('tab-obras');
    if (obrasContainer) {
        // Preparamos el grid para las tarjetas de historias
        obrasContainer.innerHTML = '<div class="featured-stories-grid"></div>';
        const obrasGrid = obrasContainer.querySelector('.featured-stories-grid');
        
        try {
            const { data: publicStories, error } = await clienteSupabase
                .from('stories')
                .select('*')
                .eq('author_id', targetProfileId);
            
            if (error) throw error;

            if (publicStories && publicStories.length > 0) {
                publicStories.forEach(story => {
                    const cardHTML = `
                        <a href="historia.html?id=${story.id}" class="story-card-link">
                            <div class="story-card">
                                <img src="${story.cover_image_url || 'https://placehold.co/300x450/26DDC6/1a1a1a?text=Portada'}" alt="Portada de ${story.title}">
                                <h3 class="card-title">${story.title}</h3>
                            </div>
                        </a>`;
                    obrasGrid.insertAdjacentHTML('beforeend', cardHTML);
                });
            } else {
                obrasGrid.innerHTML = '<h4 style="grid-column: 1 / -1; text-align: center; font-weight: normal;">Este autor aún no tiene obras públicas.</h4>';
            }
        } catch (error) {
            console.error("Error al cargar las obras públicas:", error.message);
            obrasGrid.innerHTML = '<p>No se pudieron cargar las obras.</p>';
        }
    }

    // Cargar Bitácora
    const feedContainer = document.getElementById('bitacora-feed-container');
    const cargarBitacora = async () => {
        try {
            const { data: bitacoraEntries, error } = await clienteSupabase
                .from('bitacora')
                .select('*')
                .eq('author_id', targetProfileId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            feedContainer.innerHTML = '';

            if (bitacoraEntries.length === 0) {
                feedContainer.innerHTML = '<p>Aún no hay entradas en esta bitácora.</p>';
            } else {
                bitacoraEntries.forEach(entry => {
                    const esArticulo = entry.type === 'articulo';
                    const fecha = new Date(entry.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                    
                    const deleteButtonHTML = isOwnProfile ? `<a href="#" class="delete-entry-btn" data-entry-id="${entry.id}">Borrar</a>` : '';

                    const entryHTML = `
                        <div class="bitacora-entry ${esArticulo ? 'entry-articulo' : ''}">
                            <div class="bitacora-header">
                                <div>
                                    ${esArticulo ? `<h3 class="bitacora-title">${entry.title}</h3>` : ''}
                                    <span class="entry-meta">${esArticulo ? 'ARTÍCULO' : 'APUNTE'} • ${fecha}</span>
                                </div>
                                <div class="bitacora-actions">
                                    ${deleteButtonHTML}
                                </div>
                            </div>
                            <div class="bitacora-content">
                                <p>${entry.content}</p>
                            </div>
                        </div>
                    `;
                    feedContainer.insertAdjacentHTML('beforeend', entryHTML);
                });
            }
        } catch (error) {
            feedContainer.innerHTML = '<p>Error al cargar la bitácora.</p>';
        }
    };
    
    await cargarBitacora();

    // Listener para borrar entradas (solo se activa si es nuestro propio perfil)
    if (isOwnProfile) {
        feedContainer.addEventListener('click', async (event) => {
            if (event.target && event.target.classList.contains('delete-entry-btn')) {
                event.preventDefault();
                const entryId = event.target.dataset.entryId;
                if (confirm('¿Estás seguro de que quieres borrar esta entrada?')) {
                    try {
                        const { error } = await clienteSupabase.from('bitacora').delete().eq('id', entryId);
                        if (error) throw error;
                        await cargarBitacora();
                    } catch (error) {
                        alert('Error al borrar la entrada: ' + error.message);
                    }
                }
            }
        });
    }
}

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

    // --- Referencias a Elementos del DOM ---
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('story_id');
    const chapterId = params.get('chapter_id'); 

    const heading = document.getElementById('editor-heading');
    const chapterListDiv = document.getElementById('editor-chapter-list');
    const backToManagementLink = document.getElementById('back-to-management-link');
    const addNewChapterBtn = document.getElementById('add-new-chapter-editor-btn');
    
    const editorForm = document.getElementById('chapter-editor-form');
    const titleInput = document.getElementById('chapter-title-input');
    const contentInput = document.getElementById('chapter-content-input');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const deleteChapterBtn = document.getElementById('delete-chapter-btn');
    const editorError = document.getElementById('editor-error');

    if (!storyId) {
        editorLayout.innerHTML = '<h1>Error: ID de historia no encontrado. No se puede cargar el editor.</h1>';
        return;
    }
    backToManagementLink.href = `gestionar-historia.html?id=${storyId}`;
    addNewChapterBtn.href = `editar-capitulo.html?story_id=${storyId}`;

    if (!chapterId) {
        deleteChapterBtn.style.display = 'none';
    }

    try {
        const { data: chapters, error: chaptersError } = await clienteSupabase
            .from('chapters')
            .select('*')
            .eq('story_id', storyId)
            .order('chapter_number', { ascending: true });

        if (chaptersError) throw chaptersError;

        chapterListDiv.innerHTML = '';
        if (chapters && chapters.length > 0) {
            chapters.forEach(chap => {
                // Aquí usamos chapterId como string, lo cual está bien para la comparación de clases
                const isActive = chap.id == chapterId; // Usamos '==' que es menos estricto, o podríamos parsear
                const activeClass = isActive ? 'active-chapter' : '';
                const chapterLink = `<a href="editar-capitulo.html?story_id=${storyId}&chapter_id=${chap.id}" class="${activeClass}">${chap.chapter_number}. ${chap.title}</a>`;
                chapterListDiv.insertAdjacentHTML('beforeend', chapterLink);
            });
        } else {
            chapterListDiv.innerHTML = '<p style="padding: 10px;">Aún no hay capítulos.</p>';
        }

        if (chapterId) {
            // ===== LA CORRECCIÓN ESTÁ AQUÍ =====
            const chapterToEdit = chapters.find(c => c.id === parseInt(chapterId));
            
            if (chapterToEdit) {
                heading.textContent = `Editando: ${chapterToEdit.title}`;
                titleInput.value = chapterToEdit.title;
                contentInput.value = chapterToEdit.content;
            } else {
                 heading.textContent = 'Error: Capítulo no encontrado.';
            }
        } else {
            heading.textContent = 'Creando Nuevo Capítulo';
        }

        const guardarCapitulo = async (status) => {
            editorError.textContent = '';
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            if (!title || !content) {
                editorError.textContent = 'El título y el contenido no pueden estar vacíos.';
                return;
            }

            try {
                if (chapterId) {
                    const { error } = await clienteSupabase.from('chapters').update({ title, content, status }).eq('id', chapterId);
                    if (error) throw error;
                    alert('¡Capítulo actualizado con éxito!');
                } else {
                    const newChapterNumber = (chapters ? chapters.length : 0) + 1;
                    const { error } = await clienteSupabase.from('chapters').insert({
                        story_id: storyId,
                        title,
                        content,
                        status,
                        chapter_number: newChapterNumber
                    });
                    if (error) throw error;
                    alert('¡Capítulo creado con éxito!');
                }
                window.location.href = `gestionar-historia.html?id=${storyId}`;
            } catch (error) {
                editorError.textContent = 'Error al guardar el capítulo: ' + error.message;
            }
        };
        
        editorForm.addEventListener('submit', (event) => {
            event.preventDefault();
            guardarCapitulo('publicado');
        });

        saveDraftBtn.addEventListener('click', () => {
            guardarCapitulo('borrador');
        });

        deleteChapterBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que quieres borrar este capítulo? Esta acción no se puede deshacer.')) {
                try {
                    const { error } = await clienteSupabase.from('chapters').delete().eq('id', chapterId);
                    if (error) throw error;
                    alert('Capítulo borrado con éxito.');
                    window.location.href = `gestionar-historia.html?id=${storyId}`;
                } catch (error) {
                    editorError.textContent = 'Error al borrar el capítulo: ' + error.message;
                }
            }
        });

    } catch (error) {
        editorLayout.innerHTML = `<h1>Error al cargar los datos del editor.</h1><p>${error.message}</p>`;
    }
};

// =================================================================
// SECCIÓN 6: PUNTO DE ENTRADA DE LA APLICACIÓN (VERSIÓN LIMPIA)
// =================================================================
document.addEventListener('DOMContentLoaded', async () => {
    
     const loadComponents = async () => {
        const headerElement = document.querySelector('header');
        const footerElement = document.querySelector('footer');

        // Si existen los elementos, cargamos el contenido
        if (headerElement) {
            try {
                const response = await fetch('header.html');
                if (!response.ok) throw new Error('No se pudo cargar el header.');
                headerElement.innerHTML = await response.text();
            } catch (error) {
                console.error('Error cargando el header:', error);
                headerElement.innerHTML = '<p>Error al cargar el menú de navegación.</p>';
            }
        }

        if (footerElement) {
             try {
                const response = await fetch('footer.html');
                if (!response.ok) throw new Error('No se pudo cargar el footer.');
                footerElement.innerHTML = await response.text();
            } catch (error) {
                console.error('Error cargando el footer:', error);
                footerElement.innerHTML = '<p>Error al cargar el pie de página.</p>';
            }
        }
    };
    
    await loadComponents();
    
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