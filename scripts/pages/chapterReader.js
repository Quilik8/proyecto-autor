// --- Página de Lectura de Capítulo ---
import { clienteSupabase } from '../supabaseClient.js';

export const inicializarPaginaDeLectura = async () => {
    const chapterContainer = document.querySelector('.reading-container');
    if (!chapterContainer) return;

    const params = new URLSearchParams(window.location.search);
    const chapterId = params.get('id');
    if (!chapterId) {
        chapterContainer.innerHTML = '<h1>Error: ID de capítulo no encontrado.</h1>';
        return;
    }

    try {
        // 1. Obtenemos los datos del capítulo actual
        const { data: chapter, error } = await clienteSupabase
            .from('chapters')
            .select('*')
            .eq('id', chapterId)
            .single();

        if (error || !chapter) throw error || new Error('Capítulo no encontrado');
        
        // 2. Rellenamos el contenido principal
        document.getElementById('chapter-title-h1').textContent = chapter.title;
        document.getElementById('chapter-content-article').innerHTML = `<p>${chapter.content.replace(/\n/g, '</p><p>')}</p>`;

        // 3. Obtenemos la lista completa de capítulos de la misma historia para la navegación
        const { data: allChapters, error: listError } = await clienteSupabase
            .from('chapters')
            .select('id, chapter_number')
            .eq('story_id', chapter.story_id)
            .eq('status', 'publicado') // Solo navegamos entre capítulos publicados
            .order('chapter_number', { ascending: true });

        if (listError) throw listError;

        // 4. Encontramos la posición del capítulo actual en la lista
        const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
        
        // 5. Determinamos el capítulo anterior y siguiente
        const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
        const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

        // 6. Actualizamos los enlaces de navegación
        if (prevChapter) {
            const prevLink = `capitulo.html?id=${prevChapter.id}`;
            document.getElementById('nav-anterior-top').href = prevLink;
            document.getElementById('nav-anterior-bottom').href = prevLink;
            document.getElementById('nav-anterior-top').style.visibility = 'visible';
            document.getElementById('nav-anterior-bottom').style.visibility = 'visible';
        }

        if (nextChapter) {
            const nextLink = `capitulo.html?id=${nextChapter.id}`;
            document.getElementById('nav-siguiente-top').href = nextLink;
            document.getElementById('nav-siguiente-bottom').href = nextLink;
            document.getElementById('nav-siguiente-top').style.visibility = 'visible';
            document.getElementById('nav-siguiente-bottom').style.visibility = 'visible';
        }

    } catch (error) {
        chapterContainer.innerHTML = `<h1>Error al cargar el capítulo.</h1><p>${error.message}</p>`;
    }
};