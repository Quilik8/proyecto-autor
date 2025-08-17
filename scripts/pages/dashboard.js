import { clienteSupabase } from '../supabaseClient.js';

export const inicializarDashboard = async () => {
    const dashboardPage = document.querySelector('[data-page="dashboard"]');
    if (!dashboardPage) return;

    // Redirigir si el usuario no está logueado
    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    const currentUserId = session.user.id;

    // Lógica para que las pestañas del dashboard funcionen
    const tabs = dashboardPage.querySelectorAll('.tab-link');
    const tabContents = dashboardPage.querySelectorAll('.tab-content');

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
        const storiesListDiv = document.getElementById('gestion-stories-list');
        storiesListDiv.innerHTML = '<p>Error al cargar tus historias.</p>';
    }
    
    // =====================================================================
    // --- LÓGICA DE COLABORACIONES (VERSIÓN CON SECCIONES SEPARADAS) ---
    // =====================================================================
    const receivedContainer = document.getElementById('received-collabs-container');
    const sentContainer = document.getElementById('sent-collabs-container');

        const renderCollaboration = (collab, perspective) => {
        const storyTitle = collab.stories.title;
        let actionsHTML = `<span class="status-tag">${collab.status}</span>`;
        let revieweeId = null; // ID de la persona a la que VAMOS a reseñar

        if (perspective === 'received') {
            const authorName = collab.profiles.username;
            const authorProfileLink = `perfil.html?id=${collab.author_id}`;
            revieweeId = collab.author_id; // Si yo recibí la propuesta, reseño al autor
            
            if (collab.status === 'propuesto') {
                actionsHTML = `<div class="collaboration-actions"><button class="cta-button accept-collab-btn" data-collab-id="${collab.id}">Aceptar</button><button class="cta-button secondary reject-collab-btn" data-collab-id="${collab.id}">Rechazar</button></div>`;
            }
        
        } else { // perspective === 'sent'
            const collabName = collab.collaborator.username;
            const collabProfileLink = `perfil.html?id=${collab.collaborator_id}`;
            revieweeId = collab.collaborator_id; // Si yo envié la propuesta, reseño al colaborador

            if (collab.status === 'aceptado') {
                actionsHTML = `<div class="collaboration-actions"><span class="status-tag" style="background-color: #27ae60;">Aceptado</span><button class="cta-button complete-collab-btn" data-collab-id="${collab.id}">Marcar como Completado</button></div>`;
            }
        }
        
        // Esta regla se aplica a AMBAS perspectivas
        if (collab.status === 'completado') {
            actionsHTML = `<div class="collaboration-actions"><span class="status-tag" style="background-color: var(--primary-color);">Completado</span><button class="cta-button review-collab-btn" data-collab-id="${collab.id}" data-reviewee-id="${revieweeId}">Dejar Reseña</button></div>`;
        }

        // El HTML que se renderiza no cambia, solo la lógica de los botones
        if (perspective === 'received') {
            return `<div class="management-list-item"><div><h4>Propuesta para: <strong>${storyTitle}</strong></h4><p>Rol: <strong>${collab.collaborator_role}</strong></p><p>Autor: <a href="perfil.html?id=${collab.author_id}">${collab.profiles.username}</a></p></div>${actionsHTML}</div>`;
        } else {
            return `<div class="management-list-item"><div><h4>Propuesta para: <strong>${collab.collaborator.username}</strong></h4><p>Rol: <strong>${collab.collaborator_role}</strong></p><p>Obra: <strong>${storyTitle}</strong></p></div>${actionsHTML}</div>`;
        }
    };

    const cargarColaboraciones = async () => {
        receivedContainer.innerHTML = '<p>Cargando...</p>';
        sentContainer.innerHTML = '<p>Cargando...</p>';

        try {
            // Propuestas RECIBIDAS
            const { data: received, error: receivedError } = await clienteSupabase
                .from('collaborations').select('*, stories(title), profiles:author_id(username)')
                .eq('collaborator_id', currentUserId);
            if (receivedError) throw receivedError;
            if (received.length === 0) {
                receivedContainer.innerHTML = '<p>No has recibido ninguna propuesta de colaboración.</p>';
            } else {
                receivedContainer.innerHTML = received.map(c => renderCollaboration(c, 'received')).join('');
            }

            // Propuestas ENVIADAS
            const { data: sent, error: sentError } = await clienteSupabase
                .from('collaborations').select('*, stories(title), collaborator:profiles!collaborator_id(username)')
                .eq('author_id', currentUserId);
            if (sentError) throw sentError;
            if (sent.length === 0) {
                sentContainer.innerHTML = '<p>No has enviado ninguna propuesta de colaboración.</p>';
            } else {
                sentContainer.innerHTML = sent.map(c => renderCollaboration(c, 'sent')).join('');
            }
        } catch (error) {
            console.error("Error al cargar colaboraciones:", error);
            receivedContainer.innerHTML = '<p>Error al cargar propuestas.</p>';
            sentContainer.innerHTML = '<p>Error al cargar propuestas.</p>';
        }
    };

    await cargarColaboraciones();

    const collaborationsTab = document.getElementById('tab-colaboraciones');
    collaborationsTab.addEventListener('click', async (event) => {
        const collabId = event.target.dataset.collabId;
        if (!collabId) return;

        let newStatus = null;
        if (event.target.classList.contains('accept-collab-btn')) newStatus = 'aceptado';
        else if (event.target.classList.contains('reject-collab-btn')) newStatus = 'rechazado';
        else if (event.target.classList.contains('complete-collab-btn')) newStatus = 'completado';
        
        if (newStatus) {
            try {
                const { error } = await clienteSupabase.from('collaborations').update({ status: newStatus }).eq('id', collabId);
                if (error) throw error;
                await cargarColaboraciones();
            } catch (error) {
                alert('Error al actualizar la propuesta: ' + error.message);
            }
        }
    });
        // =====================================================================
    // --- LÓGICA PARA DEJAR RESEÑAS ---
    // =====================================================================
    const reviewModal = document.getElementById('review-modal');
    const closeReviewModalBtn = reviewModal.querySelector('.modal-close-btn');
    const reviewForm = document.getElementById('dashboard-review-form');
    
    // Abrir el modal de reseña
    collaborationsTab.addEventListener('click', (event) => {
        if (event.target.classList.contains('review-collab-btn')) {
            const collabId = event.target.dataset.collabId;
            const revieweeId = event.target.dataset.revieweeId;

            // Guardamos los IDs en el formulario para usarlos al enviar
            reviewForm.querySelector('#review-collab-id').value = collabId;
            reviewForm.querySelector('#review-reviewee-id').value = revieweeId;
            
            reviewForm.reset();
            reviewModal.classList.remove('hidden');
        }
    });

    // Cerrar el modal de reseña
    closeReviewModalBtn.addEventListener('click', () => reviewModal.classList.add('hidden'));
    reviewModal.addEventListener('click', (event) => {
        if (event.target === reviewModal) {
            reviewModal.classList.add('hidden');
        }
    });

    // Enviar el formulario de reseña
    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const errorDiv = document.getElementById('dashboard-review-error');
        errorDiv.textContent = '';
        const submitButton = reviewForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Publicando...';

        const rating = reviewForm.querySelector('input[name="rating"]:checked')?.value;
        const comment = document.getElementById('dashboard-review-comment').value.trim();
        const collaboration_id = document.getElementById('review-collab-id').value;
        const reviewee_id = document.getElementById('review-reviewee-id').value;

        if (!rating || !comment) {
            errorDiv.textContent = 'La valoración y el comentario son obligatorios.';
            submitButton.disabled = false;
            submitButton.textContent = 'Publicar Reseña';
            return;
        }

        try {
            const { error } = await clienteSupabase.from('reviews').insert({
                reviewer_id: currentUserId,
                reviewee_id: reviewee_id,
                rating: parseInt(rating),
                comment: comment,
                collaboration_id: collaboration_id
            });
            if (error) throw error;
            
            reviewModal.classList.add('hidden');
            alert('¡Reseña publicada con éxito!');
            await cargarColaboraciones(); // Recargamos para (en el futuro) ocultar el botón

        } catch (error) {
            errorDiv.textContent = 'Error al publicar la reseña: ' + error.message;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Publicar Reseña';
        }
    });
};