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
    cargarDatosCartera(currentUserId);

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
    // --- NUEVA FUNCIÓN AUXILIAR PARA FORMATEAR TÉRMINOS DEL CONTRATO ---
const formatContractTerms = (collab) => {
    const terms = [];
    
    // Parte del Pago Fijo
    if (collab.fixed_payment_amount > 0) {
        terms.push(`un <strong>Pago Fijo de $${collab.fixed_payment_amount.toFixed(2)}</strong>`);
    }

    // Parte del Reparto de Ganancias
    if (collab.initial_share_percentage > 0) {
        let shareTerm = `un <strong>${collab.initial_share_percentage}% de Reparto de Ganancias</strong>`;
        
        if (collab.share_earnings_cap > 0) {
            shareTerm += ` hasta ganar un máximo de <strong>$${collab.share_earnings_cap.toFixed(2)}</strong>`;
            
            if (collab.post_cap_share_percentage > 0) {
                shareTerm += `, después de lo cual el reparto se ajusta a un <strong>${collab.post_cap_share_percentage}%</strong>`;
            } else {
                shareTerm += `, después de lo cual el reparto termina`;
            }
        }
        terms.push(shareTerm);
    }

    if (terms.length === 0) {
        return '<p class="contract-terms">Este contrato no incluye una oferta económica.</p>';
    }

    // Une las partes con " y " para que se lea de forma natural.
    return `<p class="contract-terms">Oferta: ${terms.join(' y ')}.</p>`;
};

    // --- NUEVA FUNCIÓN AUXILIAR PARA FORMATEAR EL TIEMPO RESTANTE ---
const formatDeadline = (deadline, delivered_at) => {
    if (delivered_at) {
        return `<p class="deadline-info">Entregado el: ${new Date(delivered_at).toLocaleDateString('es-ES')}</p>`;
    }

    if (!deadline) return '';

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return `<p class="deadline-info overdue">Plazo Vencido</p>`;
    }
    return `<p class="deadline-info">Tiempo Restante: ${diffDays} día(s)</p>`;
};

// --- NUEVA FUNCIÓN RPC PARA CANCELAR Y DEVOLVER FONDOS ---
// Esta la crearemos en Supabase en el siguiente paso.
// Por ahora, solo necesitamos la llamada desde el JS.
const returnEscrowFunds = async (contractId) => {
    // Esta función no existe aún, la crearemos.
    // Simulará la devolución y cancelación.
    // Por ahora, solo actualizamos el estado para probar el flujo.
    return clienteSupabase.from('collaborations').update({ status: 'cancelado_por_plazo' }).eq('id', contractId);
};

    const receivedContainer = document.getElementById('received-collabs-container');
    const sentContainer = document.getElementById('sent-collabs-container');

    const renderCollaboration = (collab, perspective) => {
    const storyTitle = collab.stories.title;
    let actionsHTML = `<span class="status-tag">${collab.status}</span>`;
    let revieweeId = null;

    const contractTermsHTML = formatContractTerms(collab);
    const deadlineHTML = formatDeadline(collab.delivery_deadline, collab.delivered_at); // <-- NUEVO

    const now = new Date();
    const isOverdue = new Date(collab.delivery_deadline) < now;

    if (perspective === 'received') { // --- VISTA DEL COLABORADOR ---
        revieweeId = collab.author_id;
        if (collab.status === 'propuesto') {
            actionsHTML = `<div class="collaboration-actions"><button class="cta-button accept-collab-btn" data-collab-id="${collab.id}">Aceptar</button><button class="cta-button secondary reject-collab-btn" data-collab-id="${collab.id}">Rechazar</button></div>`;
        }
        if (collab.status === 'aceptado_pendiente_fondos') {
            actionsHTML = `<div class="collaboration-actions"><span class="status-tag pending-funds">Esperando depósito</span><button class="cta-button destructive cancel-proposal-btn" data-collab-id="${collab.id}">Cancelar Aceptación</button></div>`;
        }
        if (collab.funds_held_in_escrow && !collab.delivered_at) { // <-- Lógica mejorada
             // Solo muestra el botón de entregar si los fondos están en garantía Y no ha entregado ya
             actionsHTML = `<div class="collaboration-actions"><button class="cta-button mark-delivered-btn" data-collab-id="${collab.id}">Marcar como Entregado</button></div>`;
        }
        if (collab.delivered_at) {
            actionsHTML = `<span class="status-tag" style="background-color: var(--primary-color);">Entregado - Esperando Aprobación</span>`;
        }

    } else { // --- VISTA DEL AUTOR ---
        revieweeId = collab.collaborator_id;
        if (collab.status === 'aceptado_pendiente_fondos') {
             actionsHTML = `<div class="collaboration-actions"><button class="cta-button deposit-funds-btn" data-collab-id="${collab.id}">Depositar Fondos</button><button class="cta-button destructive cancel-proposal-btn" data-collab-id="${collab.id}">Cancelar Propuesta</button></div>`;
        }
        // Si el plazo venció y no se ha entregado, el autor puede cancelar
        else if (isOverdue && !collab.delivered_at && collab.funds_held_in_escrow) {
             actionsHTML = `<div class="collaboration-actions"><button class="cta-button destructive cancel-overdue-btn" data-collab-id="${collab.id}">Cancelar por Plazo Vencido</button></div>`;
        }
        else if (collab.funds_held_in_escrow && !collab.delivered_at) {
            actionsHTML = `<span class="status-tag funds-held">Fondos en Garantía. Trabajo en Progreso.</span>`;
        }
        // Si se entregó, el autor puede aceptar y pagar
        else if (collab.delivered_at) {
            actionsHTML = `<div class="collaboration-actions"><span class="status-tag" style="background-color: var(--primary-color);">Entregado</span><button class="cta-button release-payment-btn" data-collab-id="${collab.id}">Aceptar y Liberar Pago</button></div>`;
        }
    }
    
    // El resto de la lógica para reseñas no cambia
    const canLeaveReview = collab.status === 'pagado' || (collab.status === 'completado' && collab.fixed_payment_amount === 0);
    if (canLeaveReview) {
        const statusText = collab.status === 'pagado' ? 'Pagado' : 'Completado';
        actionsHTML = `<div class="collaboration-actions"><span class="status-tag" style="background-color: #27ae60;">${statusText}</span><button class="cta-button review-collab-btn" data-collab-id="${collab.id}" data-reviewee-id="${revieweeId}">Dejar Reseña</button></div>`;
    }
    
    // Añadimos el deadlineHTML a la renderización
    if (perspective === 'received') {
        return `<div class="management-list-item"><div><h4>Propuesta para: <strong>${storyTitle}</strong></h4><p>Rol: <strong>${collab.collaborator_role}</strong></p>${contractTermsHTML}${deadlineHTML}<p>Autor: <a href="perfil.html?id=${collab.author_id}">${collab.profiles.username}</a></p></div>${actionsHTML}</div>`;
    } else {
        return `<div class="management-list-item"><div><h4>Propuesta para: <strong>${collab.collaborator.username}</strong></h4><p>Obra: <strong>${storyTitle}</strong> | Rol: <strong>${collab.collaborator_role}</strong></p>${contractTermsHTML}${deadlineHTML}</div>${actionsHTML}</div>`;
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

    // --- NUEVA ACCIÓN: Marcar como Entregado (Colaborador) ---
    if (event.target.classList.contains('mark-delivered-btn')) {
        if (confirm('Esto notificará al autor que has completado tu trabajo. ¿Estás seguro?')) {
            try {
                // Actualizamos la fila poniendo la fecha de entrega
                const { error } = await clienteSupabase
                    .from('collaborations')
                    .update({ delivered_at: new Date().toISOString() })
                    .eq('id', collabId);
                if (error) throw error;
                await cargarColaboraciones();
            } catch (error) {
                alert('Error al marcar como entregado: ' + error.message);
            }
        }
    }
    
    // --- NUEVA ACCIÓN: Cancelar por Plazo Vencido (Autor) ---
    else if (event.target.classList.contains('cancel-overdue-btn')) {
        if (confirm('Esto cancelará el contrato y devolverá los fondos a tu cartera. Esta acción es irreversible. ¿Estás seguro?')) {
            event.target.disabled = true;
            event.target.textContent = 'Cancelando...';
            try {
                // Llamamos a la función que crearemos en Supabase
                const { error } = await returnEscrowFunds(collabId); // Usamos nuestra función simulada por ahora
                if (error) throw error;
                alert('Contrato cancelado y fondos devueltos con éxito.');
                await cargarColaboraciones();
            } catch (error) {
                alert('Error al cancelar el contrato: ' + error.message);
                event.target.disabled = false;
                event.target.textContent = 'Cancelar por Plazo Vencido';
            }
        }
    }

    // Acción de Cancelar Propuesta antes del depósito
    else if (event.target.classList.contains('cancel-proposal-btn')) {
        if (confirm('¿Estás seguro de que quieres cancelar este acuerdo? Esta acción no se puede deshacer.')) {
            try {
                const { error } = await clienteSupabase.from('collaborations').update({ status: 'cancelado' }).eq('id', collabId);
                if (error) throw error;
                await cargarColaboraciones();
            } catch (error) {
                alert('Error al cancelar el acuerdo: ' + error.message);
            }
        }
    }

    // Acción de Aceptar una propuesta
    else if (event.target.classList.contains('accept-collab-btn')) {
        try {
            const { data: collab, error: fetchError } = await clienteSupabase.from('collaborations').select('fixed_payment_amount').eq('id', collabId).single();
            if (fetchError) throw fetchError;
            const newStatus = collab.fixed_payment_amount > 0 ? 'aceptado_pendiente_fondos' : 'aceptado';
            const { error } = await clienteSupabase.from('collaborations').update({ status: newStatus }).eq('id', collabId);
            if (error) throw error;
            await cargarColaboraciones();
        } catch (error) {
            alert('Error al aceptar la propuesta: ' + error.message);
        }
    }

    // Acción de Rechazar una propuesta
    else if (event.target.classList.contains('reject-collab-btn')) {
        if (confirm('¿Estás seguro de que quieres rechazar esta propuesta?')) {
            try {
                const { error } = await clienteSupabase.from('collaborations').update({ status: 'rechazado' }).eq('id', collabId);
                if (error) throw error;
                await cargarColaboraciones();
            } catch (error) {
                alert('Error al rechazar la propuesta: ' + error.message);
            }
        }
    }

    // Acción de Depositar fondos en garantía
    else if (event.target.classList.contains('deposit-funds-btn')) {
        if (confirm('Esto transferirá los fondos desde tu cartera a una bóveda segura para este contrato. ¿Estás seguro?')) {
            event.target.disabled = true;
            event.target.textContent = 'Procesando...';
            try {
                const { error } = await clienteSupabase.rpc('hold_contract_funds', { contract_id: collabId });
                if (error) throw error;
                alert('¡Fondos depositados en garantía con éxito!');
                await cargarColaboraciones();
            } catch (error) {
                alert('Error al depositar los fondos: ' + error.message);
                event.target.disabled = false;
                event.target.textContent = 'Depositar Fondos';
            }
        }
    }

    // Acción de Liberar el pago al colaborador
    else if (event.target.classList.contains('release-payment-btn')) {
        if (confirm('Esto aceptará la entrega y transferirá permanentemente los fondos al colaborador. ¿Confirmas el pago?')) {
            event.target.disabled = true;
            event.target.textContent = 'Pagando...';
            try {
                const { error } = await clienteSupabase.rpc('release_contract_funds', { contract_id: collabId });
                if (error) throw error;
                alert('¡Pago liberado con éxito! El colaborador ha recibido los fondos en su cartera.');
                await cargarColaboraciones();
            } catch (error) {
                alert('Error al liberar el pago: ' + error.message);
                event.target.disabled = false;
                event.target.textContent = 'Aceptar y Liberar Pago';
            }
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

const cargarDatosCartera = async (currentUserId) => {
    const balanceAmountEl = document.getElementById('wallet-balance-amount');
    const historyListEl = document.getElementById('earnings-history-list');

    if (!balanceAmountEl || !historyListEl) return;

    try {
        // 1. Cargar el balance actual de la cartera
        const { data: profile, error: profileError } = await clienteSupabase
            .from('profiles')
            .select('virtual_wallet_balance')
            .eq('id', currentUserId)
            .single();
        
        if (profileError) throw profileError;

        balanceAmountEl.textContent = `$${profile.virtual_wallet_balance.toFixed(2)}`;

        // 2. Cargar el historial de ganancias
        const { data: earnings, error: earningsError } = await clienteSupabase
            .from('earnings')
            .select(`
                created_at,
                amount,
                stories (title)
            `)
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: false });

        if (earningsError) throw earningsError;

        if (earnings.length === 0) {
            historyListEl.innerHTML = '<p>Aún no tienes movimientos en tu historial de ganancias.</p>';
            return;
        }

        historyListEl.innerHTML = ''; // Limpiamos el mensaje de "Cargando..."
        earnings.forEach(earning => {
            const date = new Date(earning.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            const earningHTML = `
                <div class="earning-item">
                    <div class="earning-item-details">
                        <strong>Ganancia por reparto de ganancias</strong>
                        <p>Obra: ${earning.stories.title} &bull; ${date}</p>
                    </div>
                    <span class="earning-item-amount">+$${earning.amount.toFixed(2)}</span>
                </div>
            `;
            historyListEl.insertAdjacentHTML('beforeend', earningHTML);
        });

    } catch (error) {
        balanceAmountEl.textContent = 'Error';
        historyListEl.innerHTML = '<p>No se pudo cargar el historial de la cartera.</p>';
        console.error('Error al cargar datos de la cartera:', error);
    }
};