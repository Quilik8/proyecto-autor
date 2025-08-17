// --- Página de Crear Entrada de Bitácora ---
import { clienteSupabase } from '../supabaseClient.js';

export const inicializarPaginaCrearEntrada = async () => {
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