// --- Página de Detalle de Historia (VERSIÓN CORREGIDA PARA ENLACES DE PERFIL) ---
import { clienteSupabase } from '../supabaseClient.js';

export const inicializarPaginaDetalleHistoria = async () => {
    const storyPage = document.querySelector('[data-page="detalle-historia"]');
    if (!storyPage) return;

    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id');
    if (!storyId) {
        document.querySelector('main').innerHTML = '<h1>Error: ID de historia no encontrado.</h1>';
        return;
    }

    try {
        // La consulta ahora pide el 'id' y 'username' del perfil relacionado
        const { data: story, error: storyError } = await clienteSupabase
            .from('stories')
            .select('*, profiles(id, username)') // <-- CAMBIO CLAVE AQUÍ
            .eq('id', storyId)
            .single();

        if (storyError) throw storyError;

        const { data: chapters, error: chaptersError } = await clienteSupabase
            .from('chapters')
            .select('*')
            .eq('story_id', storyId)
            .eq('status', 'publicado')
            .order('chapter_number', { ascending: true });

        if (chaptersError) throw chaptersError;

        // Actualización de la UI
        document.getElementById('story-cover-image').src = story.cover_image_url || 'https://placehold.co/300x450/80E9D9/1a1a1a?text=Portada';
        document.getElementById('story-cover-image').alt = `Portada de ${story.title}`;
        document.getElementById('story-title').textContent = story.title;
        
        // El enlace ahora usa 'story.profiles.id' que está garantizado que existe
        const authorElement = document.getElementById('story-author');
        authorElement.innerHTML = `por <a href="perfil.html?id=${story.profiles.id}">${story.profiles.username}</a>`;
        
        document.getElementById('story-meta').textContent = story.genre || 'Sin género';
        document.getElementById('story-synopsis').textContent = story.synopsis;

        // ... (el resto de la función para cargar capítulos no cambia)
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