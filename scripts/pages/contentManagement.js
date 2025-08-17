// =================================================================
//FUNCIONES DE GESTIÓN DE CONTENIDO (REFACTORIZADAS)
// =================================================================
import { clienteSupabase } from '../supabaseClient.js';

export const inicializarCrearHistoria = async () => {
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

export const inicializarGestionHistoria = async () => {
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

export const inicializarEditarCapitulo = async () => {
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