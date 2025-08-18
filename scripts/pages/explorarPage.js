import { clienteSupabase } from '../supabaseClient.js';

// =================================================================
// SECCIÓN 1: LÓGICA PARA LA PESTAÑA DE HISTORIAS
// =================================================================

export const fetchAndRenderStories = async () => {
    const grid = document.querySelector('.featured-stories-grid');
    if (!grid) return;
    grid.innerHTML = '<p>Cargando historias...</p>';

    try {
        // Obtenemos el parámetro de búsqueda de la URL, si existe
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        
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


// =================================================================
// SECCIÓN 2: LÓGICA PARA LA PESTAÑA DEL GREMIO
// =================================================================

const PREDEFINED_ROLES = ['Autor', 'Lector', 'Editor', 'Diseñador', 'Traductor', 'Beta-Reader', 'Crítico'];

const renderProfileCard = (profile) => {
    const avatarUrl = profile.avatar_url || 'https://placehold.co/150x150/80E9D9/1a1a1a?text=Avatar';
    const rolesHTML = profile.roles && profile.roles.length > 0 
        ? profile.roles.map(role => `<span class="role-tag">${role}</span>`).join('')
        : '<p style="font-size: 14px; color: var(--color-text-secondary);">Sin roles definidos</p>';

    return `
        <div class="profile-card">
            <div class="profile-card-header">
                <img src="${avatarUrl}" alt="Avatar de ${profile.username}">
                <h3>${profile.username}</h3>
            </div>
            <p class="profile-card-bio">${profile.bio || 'Este usuario aún no ha añadido una biografía.'}</p>
            <div class="profile-card-roles">${rolesHTML}</div>
            <div class="profile-card-footer">
                <a href="perfil.html?id=${profile.id}" class="cta-button">Ver Perfil</a>
            </div>
        </div>
    `;
};

const inicializarGremio = async () => {
    const filtersForm = document.getElementById('gremio-filters-form');
    const searchInput = document.getElementById('gremio-search-input');
    const customRoleInput = document.getElementById('gremio-custom-role-input');
    const rolesContainer = document.getElementById('gremio-roles-container');
    const resultsGrid = document.getElementById('gremio-results-grid');

    if (!filtersForm) return;

    rolesContainer.innerHTML = '';
    PREDEFINED_ROLES.forEach(role => {
        const roleId = `role-filter-${role.toLowerCase().replace(' ', '-')}`;
        rolesContainer.insertAdjacentHTML('beforeend', `
            <div class="role-checkbox-item">
                <input type="checkbox" id="${roleId}" name="role_filter" value="${role}">
                <label for="${roleId}">${role}</label>
            </div>
        `);
    });

    const fetchAndRenderProfiles = async () => {
        resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Buscando talento...</p>';

        const searchTerm = searchInput.value.trim();
        const selectedRoles = Array.from(rolesContainer.querySelectorAll('input:checked')).map(input => input.value);
        const customRoles = customRoleInput.value.split(',').map(role => role.trim()).filter(role => role);
        const allRoles = [...new Set([...selectedRoles, ...customRoles])];

        try {
            let query = clienteSupabase.from('profiles').select('*');
            if (searchTerm) query = query.ilike('username', `%${searchTerm}%`);
            if (allRoles.length > 0) query = query.contains('roles', allRoles);
            
            const { data: profiles, error } = await query.order('username', { ascending: true });
            if (error) throw error;

            if (profiles.length === 0) {
                resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No se encontraron perfiles que coincidan con tu búsqueda.</p>';
            } else {
                resultsGrid.innerHTML = profiles.map(renderProfileCard).join('');
            }
        } catch (error) {
            console.error('Error al buscar perfiles:', error);
            resultsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #e74c3c;">Ocurrió un error al cargar los perfiles.</p>';
        }
    };

    filtersForm.addEventListener('submit', (event) => {
        event.preventDefault();
        fetchAndRenderProfiles();
    });

    await fetchAndRenderProfiles();
};


// =================================================================
// SECCIÓN 3: CONTROLADOR PRINCIPAL DE LA PÁGINA
// =================================================================

let isGremioInitialized = false;

export const inicializarPaginaExplorar = async () => {
    const tabs = document.querySelectorAll('.explore-page-container .tab-link');
    const tabContents = document.querySelectorAll('.explore-page-container .tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            tab.classList.add('active');
            const targetContent = document.getElementById(tab.dataset.tab);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            if (tab.dataset.tab === 'gremio-content' && !isGremioInitialized) {
                await inicializarGremio();
                isGremioInitialized = true;
            }
        });
    });

    await fetchAndRenderStories();
};