import { clienteSupabase } from '../supabaseClient.js';

export const inicializarPaginaDePerfil = async () => {
    const profilePageContainer = document.querySelector('.profile-page-container');
    if (!profilePageContainer) return;

    // --- PASO 1: Determinar qué perfil mostrar ---
    const params = new URLSearchParams(window.location.search);
    let targetProfileId = params.get('id');

    const { data: { session } } = await clienteSupabase.auth.getSession();
    const currentUserId = session ? session.user.id : null;

    const isOwnProfile = !targetProfileId || targetProfileId === currentUserId;

    if (isOwnProfile && !currentUserId) {
        window.location.href = 'login.html';
        return;
    }
    
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

        if (isOwnProfile) {
            document.getElementById('edit-profile-btn').classList.remove('hidden');
            document.getElementById('profile-email').classList.remove('hidden');
            document.getElementById('profile-email').textContent = session.user.email;
        }

    } catch (error) {
        profilePageContainer.innerHTML = '<h1>Perfil no encontrado</h1><p>El usuario que buscas no existe o ha sido eliminado.</p>';
        return;
    }

    // --- PASO 3: Lógica de Pestañas ---
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

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

    // --- PASO 4: Cargar datos de las pestañas ---
    const obrasContainer = document.getElementById('tab-obras');
    if (obrasContainer) {
        obrasContainer.innerHTML = '<div class="featured-stories-grid"></div>';
        const obrasGrid = obrasContainer.querySelector('.featured-stories-grid');
        try {
            const { data: publicStories, error } = await clienteSupabase.from('stories').select('*').eq('author_id', targetProfileId);
            if (error) throw error;
            if (publicStories && publicStories.length > 0) {
                publicStories.forEach(story => {
                    const cardHTML = `<a href="historia.html?id=${story.id}" class="story-card-link"><div class="story-card"><img src="${story.cover_image_url || 'https://placehold.co/300x450/26DDC6/1a1a1a?text=Portada'}" alt="Portada de ${story.title}"><h3 class="card-title">${story.title}</h3></div></a>`;
                    obrasGrid.insertAdjacentHTML('beforeend', cardHTML);
                });
            } else {
                obrasGrid.innerHTML = '<h4 style="grid-column: 1 / -1; text-align: center; font-weight: normal;">Este autor aún no tiene obras públicas.</h4>';
            }
        } catch (error) {
            obrasGrid.innerHTML = '<p>No se pudieron cargar las obras.</p>';
        }
    }

    const feedContainer = document.getElementById('bitacora-feed-container');
    const cargarBitacora = async () => {
        try {
            const { data: bitacoraEntries, error } = await clienteSupabase.from('bitacora').select('*').eq('author_id', targetProfileId).order('created_at', { ascending: false });
            if (error) throw error;
            feedContainer.innerHTML = '';
            if (bitacoraEntries.length === 0) {
                feedContainer.innerHTML = '<p>Aún no hay entradas en esta bitácora.</p>';
            } else {
                bitacoraEntries.forEach(entry => {
                    const esArticulo = entry.type === 'articulo';
                    const fecha = new Date(entry.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                    const deleteButtonHTML = isOwnProfile ? `<a href="#" class="delete-entry-btn" data-entry-id="${entry.id}">Borrar</a>` : '';
                    const entryHTML = `<div class="bitacora-entry ${esArticulo ? 'entry-articulo' : ''}"><div class="bitacora-header"><div>${esArticulo ? `<h3 class="bitacora-title">${entry.title}</h3>` : ''}<span class="entry-meta">${esArticulo ? 'ARTÍCULO' : 'APUNTE'} • ${fecha}</span></div><div class="bitacora-actions">${deleteButtonHTML}</div></div><div class="bitacora-content"><p>${entry.content}</p></div></div>`;
                    feedContainer.insertAdjacentHTML('beforeend', entryHTML);
                });
            }
        } catch (error) {
            feedContainer.innerHTML = '<p>Error al cargar la bitácora.</p>';
        }
    };
    await cargarBitacora();

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

    // =====================================================================
    // --- LÓGICA DEL PORTAFOLIO ---
    // (Todo el código del portafolio que ya añadimos permanece aquí, sin cambios)
    // =====================================================================
    const portfolioActionsContainer = document.getElementById('portfolio-actions-container');
    const portfolioItemsContainer = document.getElementById('portfolio-items-container');

    const renderPortfolioItem = (item) => {
        const actionsHTML = isOwnProfile ? `<div class="portfolio-item-actions"><button data-item-id="${item.id}" class="edit-portfolio-btn">✏️</button><button data-item-id="${item.id}" class="delete-portfolio-btn">🗑️</button></div>` : '';
        return `<div class="portfolio-item" id="item-${item.id}">${actionsHTML}<h4>${item.title}</h4><p>${item.description}</p>${item.link_url ? `<a href="${item.link_url}" target="_blank" rel="noopener noreferrer">Ver trabajo</a>` : ''}</div>`;
    };

    const cargarPortfolio = async () => {
        portfolioItemsContainer.innerHTML = '<p>Cargando portafolio...</p>';
        try {
            const { data, error } = await clienteSupabase.from('portfolio_items').select('*').eq('user_id', targetProfileId).order('created_at', { ascending: false });
            if (error) throw error;
            if (data.length === 0) {
                portfolioItemsContainer.innerHTML = '<p>Este usuario aún no ha añadido nada a su portafolio.</p>';
            } else {
                portfolioItemsContainer.innerHTML = data.map(renderPortfolioItem).join('');
            }
        } catch (error) {
            portfolioItemsContainer.innerHTML = '<p>Error al cargar el portafolio.</p>';
        }
    };

    if (isOwnProfile) {
        portfolioActionsContainer.classList.remove('hidden');
    }
    await cargarPortfolio();

    // --- LÓGICA DEL FORMULARIO DEL PORTAFOLIO ---
    if (isOwnProfile) {
        const addPortfolioBtn = document.getElementById('add-portfolio-item-btn');
        const portfolioForm = document.getElementById('portfolio-form');
        const cancelPortfolioFormBtn = document.getElementById('cancel-portfolio-form-btn');
        const portfolioFormTitle = document.getElementById('portfolio-form-title');
        const portfolioItemIdInput = document.getElementById('portfolio-item-id');
        const portfolioTitleInput = document.getElementById('portfolio-title');
        const portfolioDescriptionInput = document.getElementById('portfolio-description');
        const portfolioLinkInput = document.getElementById('portfolio-link');
        const portfolioFormError = document.getElementById('portfolio-form-error');

        const showPortfolioForm = (show = true) => {
            portfolioForm.classList.toggle('hidden', !show);
            portfolioItemsContainer.classList.toggle('hidden', show);
            portfolioActionsContainer.classList.toggle('hidden', show);
        };

        addPortfolioBtn.addEventListener('click', () => {
            portfolioForm.reset();
            portfolioItemIdInput.value = '';
            portfolioFormTitle.textContent = 'Añadir al Portafolio';
            portfolioFormError.textContent = '';
            showPortfolioForm(true);
        });

        cancelPortfolioFormBtn.addEventListener('click', () => {
            showPortfolioForm(false);
        });

        portfolioForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            portfolioFormError.textContent = '';
            const submitButton = portfolioForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Guardando...';

            const title = portfolioTitleInput.value.trim();
            const description = portfolioDescriptionInput.value.trim();
            const link_url = portfolioLinkInput.value.trim();
            const itemId = portfolioItemIdInput.value;

            if (!title || !description) {
                portfolioFormError.textContent = 'El título y la descripción son obligatorios.';
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                return;
            }

            try {
                let error;
                if (itemId) {
                    const { error: updateError } = await clienteSupabase.from('portfolio_items').update({ title, description, link_url: link_url || null }).eq('id', itemId);
                    error = updateError;
                } else {
                    const { error: insertError } = await clienteSupabase.from('portfolio_items').insert({ user_id: targetProfileId, title, description, link_url: link_url || null });
                    error = insertError;
                }
                if (error) throw error;
                showPortfolioForm(false);
                await cargarPortfolio();
            } catch (error) {
                portfolioFormError.textContent = 'Error al guardar el trabajo: ' + error.message;
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });

        portfolioItemsContainer.addEventListener('click', async (event) => {
            const editBtn = event.target.closest('.edit-portfolio-btn');
            const deleteBtn = event.target.closest('.delete-portfolio-btn');

            if (deleteBtn) {
                const itemId = deleteBtn.dataset.itemId;
                if (confirm('¿Estás seguro de que quieres borrar este elemento del portafolio?')) {
                    try {
                        const { error } = await clienteSupabase.from('portfolio_items').delete().eq('id', itemId);
                        if (error) throw error;
                        await cargarPortfolio();
                    } catch (error) {
                        alert('Error al borrar el elemento: ' + error.message);
                    }
                }
            }

            if (editBtn) {
                const itemId = editBtn.dataset.itemId;
                try {
                    const { data: item, error } = await clienteSupabase.from('portfolio_items').select('*').eq('id', itemId).single();
                    if (error) throw error;
                    portfolioItemIdInput.value = item.id;
                    portfolioTitleInput.value = item.title;
                    portfolioDescriptionInput.value = item.description;
                    portfolioLinkInput.value = item.link_url || '';
                    portfolioFormTitle.textContent = 'Editar Trabajo del Portafolio';
                    portfolioFormError.textContent = '';
                    showPortfolioForm(true);
                } catch (error) {
                     alert('Error al cargar los datos para editar: ' + error.message);
                }
            }
        });
    }

        // =====================================================================
    // --- LÓGICA DE RESEÑAS ---
    // =====================================================================
    const reviewForm = document.getElementById('review-form');
    const reviewsListContainer = document.getElementById('reviews-list-container');

    const renderReviewItem = (review) => {
        const reviewer = review.reviewer; // Datos del perfil que escribió la reseña
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const avatarUrl = reviewer.avatar_url || 'https://placehold.co/150x150/80E9D9/1a1a1a?text=Avatar';

        return `
            <div class="review-item">
                <img src="${avatarUrl}" alt="Avatar de ${reviewer.username}" class="reviewer-avatar">
                <div class="review-content">
                    <h4>${reviewer.username}</h4>
                    <div class="review-stars">${stars}</div>
                    <p>${review.comment}</p>
                </div>
            </div>
        `;
    };

    const cargarReseñas = async () => {
        reviewsListContainer.innerHTML = '<p>Cargando reseñas...</p>';
        try {
            // Hacemos una consulta que une la reseña con el perfil del autor de la reseña
            const { data, error } = await clienteSupabase
                .from('reviews')
                .select('*, reviewer:profiles!reviewer_id(username, avatar_url)')
                .eq('reviewee_id', targetProfileId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data.length === 0) {
                reviewsListContainer.innerHTML = '<p>Este usuario aún no ha recibido ninguna reseña.</p>';
            } else {
                reviewsListContainer.innerHTML = data.map(renderReviewItem).join('');
            }

        } catch (error) {
            reviewsListContainer.innerHTML = '<p>Error al cargar las reseñas.</p>';
        }
    };

    // Mostrar el formulario de reseña solo si estoy logueado Y NO es mi propio perfil
    if (currentUserId && !isOwnProfile) {
        reviewForm.classList.remove('hidden');
    }

    await cargarReseñas();

        // =====================================================================
    // --- LÓGICA DE PROPUESTA DE COLABORACIÓN ---
    // =====================================================================
    const proposeCollabBtn = document.getElementById('propose-collab-btn');
    const collabModal = document.getElementById('collab-modal');
    const closeCollabModalBtn = collabModal.querySelector('.modal-close-btn');
    const storySelect = document.getElementById('collab-story-select');
    
    // Mostrar el botón de proponer solo si estoy logueado Y NO es mi propio perfil
    if (currentUserId && !isOwnProfile) {
        proposeCollabBtn.classList.remove('hidden');
    }

    // Lógica para abrir y cerrar el modal
    proposeCollabBtn.addEventListener('click', async () => {
        storySelect.innerHTML = '<option value="">Cargando tus obras...</option>';
        collabModal.classList.remove('hidden');
        
        // Cargar las historias del usuario actual en el select
        try {
            const { data: userStories, error } = await clienteSupabase
                .from('stories')
                .select('id, title')
                .eq('author_id', currentUserId); // Buscamos las historias del usuario LOGUEADO

            if (error) throw error;
            
            if (userStories.length === 0) {
                 storySelect.innerHTML = '<option value="">No tienes obras para proponer.</option>';
            } else {
                storySelect.innerHTML = '<option value="">-- Selecciona una obra --</option>';
                userStories.forEach(story => {
                    storySelect.insertAdjacentHTML('beforeend', `<option value="${story.id}">${story.title}</option>`);
                });
            }
        } catch (error) {
            storySelect.innerHTML = '<option value="">Error al cargar obras.</option>';
        }
    });

    closeCollabModalBtn.addEventListener('click', () => {
        collabModal.classList.add('hidden');
    });

    // Cerrar el modal si se hace clic fuera del contenido
    collabModal.addEventListener('click', (event) => {
        if (event.target === collabModal) {
            collabModal.classList.add('hidden');
        }
    });
        const collabProposalForm = document.getElementById('collab-proposal-form');
    const collabRoleInput = document.getElementById('collab-role-input');
    const collabFormError = document.getElementById('collab-form-error');

    collabProposalForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        collabFormError.textContent = '';
        const submitButton = collabProposalForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        const selectedStoryId = storySelect.value;
        const collaboratorRole = collabRoleInput.value.trim();

        if (!selectedStoryId || !collaboratorRole) {
            collabFormError.textContent = 'Debes seleccionar una obra y definir un rol.';
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Propuesta';
            return;
        }

                try {
            const { error } = await clienteSupabase.from('collaborations').insert({
                story_id: selectedStoryId,
                author_id: currentUserId,
                collaborator_id: targetProfileId,
                collaborator_role: collaboratorRole,
                status: 'propuesto' // Añadir el estado explícitamente
            });

            if (error) throw error;

            collabModal.classList.add('hidden');
            alert('¡Propuesta de colaboración enviada con éxito!');

        } catch (error) {
            collabFormError.textContent = 'Error al enviar la propuesta: ' + error.message;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Propuesta';
        }
    });
};