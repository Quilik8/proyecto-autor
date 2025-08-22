// scripts/pages/messaging.js

import { clienteSupabase } from '../supabaseClient.js';

let currentUserId = null;
let activeConversationId = null;

// Referencias al DOM
const conversationsList = document.getElementById('conversations-list');
const chatWelcomeMessage = document.getElementById('chat-welcome-message');
const chatWindow = document.getElementById('chat-window');
const chatHeader = document.getElementById('chat-header');
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

/**
 * Renderiza la lista de conversaciones en la bandeja de entrada.
 */
const renderConversations = (conversations) => {
    conversationsList.innerHTML = '';
    if (conversations.length === 0) {
        conversationsList.innerHTML = '<p>No tienes conversaciones.</p>';
        return;
    }
    conversations.forEach(convo => {
        const otherParticipant = convo.participant_one_id.id === currentUserId ? convo.participant_two_id : convo.participant_one_id;
        const avatarUrl = otherParticipant.avatar_url || 'https://placehold.co/150x150/80E9D9/1a1a1a?text=Avatar';
        const convoElement = document.createElement('div');
        convoElement.classList.add('conversation-item');
        convoElement.dataset.conversationId = convo.id;
        convoElement.dataset.unreadCount = convo.unread_count; // Guardamos el recuento aquí

        if (convo.unread_count > 0) {
            convoElement.classList.add('unread');
        }
        convoElement.innerHTML = `
            <img src="${avatarUrl}" alt="Avatar de ${otherParticipant.username}">
            <div class="conversation-details">
                <h4>${otherParticipant.username}</h4>
                <p>${convo.unread_count > 0 ? `(${convo.unread_count}) Mensaje(s) nuevo(s)` : 'Haz clic para ver los mensajes...'}</p>
            </div>
        `;
        convoElement.addEventListener('click', () => {
            document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
            convoElement.classList.add('active');
            cargarMensajes(convo.id, otherParticipant.username);
        });
        conversationsList.appendChild(convoElement);
    });
};

/**
 * Carga y muestra los mensajes de una conversación específica.
 */
const cargarMensajes = async (conversationId, otherUsername) => {
    activeConversationId = conversationId;
    chatWelcomeMessage.classList.add('hidden');
    chatWindow.classList.remove('hidden');
    chatHeader.textContent = `Chat con ${otherUsername}`;
    messagesContainer.innerHTML = '<p>Cargando mensajes...</p>';

    // --- INICIO DE LA SOLUCIÓN HÍBRIDA ---

    const conversationElement = document.querySelector(`.conversation-item[data-conversation-id="${conversationId}"]`);
    
    // PASO 1: (OPTIMISTA) Actualizamos la UI al instante si es necesario.
    if (conversationElement && conversationElement.classList.contains('unread')) {
        const unreadInThisConvo = parseInt(conversationElement.dataset.unreadCount || 0);
        
        // Disparamos el evento para que el header se actualice INMEDIATAMENTE.
        window.dispatchEvent(new CustomEvent('updateUnreadCountOptimistic', { detail: { countToSubtract: unreadInThisConvo } }));

        // Y actualizamos la bandeja de entrada INMEDIATAMENTE.
        conversationElement.classList.remove('unread');
        const detailsP = conversationElement.querySelector('.conversation-details p');
        if (detailsP) detailsP.textContent = 'Haz clic para ver los mensajes...';
    }

    try {
        // PASO 2: (GARANTIZADO) Ahora, nos comunicamos con la base de datos
        // y ESPERAMOS a que la actualización se complete usando 'await'.
        // Esto asegura que la próxima vez que cargues la página, el estado será el correcto.
        const { error: updateError } = await clienteSupabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', currentUserId);

        if (updateError) {
            console.error("Error al marcar mensajes como leídos:", updateError);
        }

        // PASO 3: Solo después de que la actualización está confirmada,
        // cargamos el contenido de los mensajes del chat.
        const { data: messages, error: selectError } = await clienteSupabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (selectError) throw selectError;
        
        messagesContainer.innerHTML = '';
        messages.forEach(msg => {
            const bubble = document.createElement('div');
            bubble.classList.add('message-bubble');
            bubble.classList.add(msg.sender_id === currentUserId ? 'sent' : 'received');
            bubble.textContent = msg.content;
            messagesContainer.appendChild(bubble);
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
        messagesContainer.innerHTML = '<p>Error al cargar los mensajes.</p>';
        console.error('Error in message loading sequence:', error);
    }
};

/**
 * Carga todas las conversaciones del usuario actual.
 */
const cargarConversaciones = async () => {
    try {
        // Usamos la nueva función RPC
        const { data, error } = await clienteSupabase.rpc('get_conversations_with_unread_count');

        if (error) throw error;
        renderConversations(data);

    } catch (error) {
        conversationsList.innerHTML = '<p>Error al cargar las conversaciones.</p>';
        console.error('Error fetching conversations:', error);
    }
};

/**
 * Envía un nuevo mensaje.
 */
const enviarMensaje = async (event) => {
    event.preventDefault();
    const content = messageInput.value.trim();
    if (!content || !activeConversationId) return;

    const submitButton = messageForm.querySelector('button');
    submitButton.disabled = true;

    try {
        const { error } = await clienteSupabase.from('messages').insert({
            conversation_id: activeConversationId,
            sender_id: currentUserId,
            content: content
        });

        if (error) throw error;

        // Limpiamos el input y recargamos los mensajes para ver el nuevo
        messageInput.value = '';
        const activeConversationElement = document.querySelector(`.conversation-item[data-conversation-id="${activeConversationId}"]`);
        const otherUsername = activeConversationElement.querySelector('h4').textContent;
        await cargarMensajes(activeConversationId, otherUsername);
        
        // Volvemos a cargar las conversaciones para que esta se ponga la primera en la lista
        await cargarConversaciones();
        // Marcamos la conversación activa de nuevo después de recargar la lista
         const reloadedActiveElement = document.querySelector(`.conversation-item[data-conversation-id="${activeConversationId}"]`);
        if (reloadedActiveElement) {
            reloadedActiveElement.classList.add('active');
        }


    } catch (error) {
        console.error('Error sending message:', error);
        alert('No se pudo enviar el mensaje.');
    } finally {
        submitButton.disabled = false;
        messageInput.focus();
    }
};


/**
 * Función principal que se ejecuta al cargar la página.
 */
export const inicializarPaginaMensajeria = async () => {
    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    currentUserId = session.user.id;

    await cargarConversaciones();
    messageForm.addEventListener('submit', enviarMensaje);
    
    // Comprobar si venimos de una URL con una conversación específica para abrir
    const params = new URLSearchParams(window.location.search);
    const conversationIdFromUrl = params.get('conversation_id');

    if (conversationIdFromUrl) {
         // Pequeña espera para asegurar que la lista de conversaciones esté renderizada
        setTimeout(() => {
            const targetConversation = document.querySelector(`.conversation-item[data-conversation-id="${conversationIdFromUrl}"]`);
            if (targetConversation) {
                targetConversation.click();
            }
        }, 200);
    }
};