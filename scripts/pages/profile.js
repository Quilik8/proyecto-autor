// --- Página de Perfil de Usuario (VERSIÓN FINAL HÍBRIDA) ---
import { clienteSupabase } from '../supabaseClient.js';

export const inicializarPaginaDePerfil = async () => {
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