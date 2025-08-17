// --- Páginas de Visualización de Historias (index, explorar) ---
import { clienteSupabase } from '../supabaseClient.js';

export const inicializarPaginasDeHistorias = async () => {
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