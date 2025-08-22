// =================================================================
// ARCHIVO DE SCRIPT PRINCIPAL PARA EL PROYECTO A.U.T.O.R.
// Versión 7.0 - Arquitectura Refactorizada y Estable
// =================================================================


// =================================================================
// SECCIÓN 1: CONFIGURACIÓN Y FUNCIONES GLOBALES
// =================================================================

import { clienteSupabase } from './supabaseClient.js';
import { configurarMenuHamburguesa, configurarInterruptorDeTema, configurarBarraDeBusqueda } from './ui.js';
import { inicializarPaginasDeFormulario } from './pages/authForms.js';
import { inicializarPaginaDetalleHistoria } from './pages/storyDetail.js';
import { inicializarPaginaDeLectura } from './pages/chapterReader.js';
import { inicializarPaginaDePerfil } from './pages/profile.js';
import { inicializarPaginaEditarPerfil } from './pages/profileEdit.js';
import { inicializarPaginaCrearEntrada } from './pages/entryCreate.js';
import { inicializarCrearHistoria, inicializarGestionHistoria, inicializarEditarCapitulo} from './pages/contentManagement.js';
import { inicializarDashboard } from './pages/dashboard.js'; 
import { inicializarPaginaExplorar, fetchAndRenderStories } from './pages/explorarPage.js';
import { inicializarPaginaMensajeria } from './pages/messaging.js';

let totalUnreadMessages = 0;

const ejecutarScriptsGlobales = async () => {
    configurarMenuHamburguesa();
    configurarInterruptorDeTema();
    configurarBarraDeBusqueda();
    await gestionarEstadoDeSesion();
    configurarBotonDeLogout();
};


// =================================================================
// SECCIÓN 2: GESTIÓN DE AUTENTICACIÓN Y SESIÓN
// =================================================================

const gestionarEstadoDeSesion = async () => {
    const navElement = document.querySelector('nav');
    const navLogin = document.querySelector("#nav-login");
    const navRegistro = document.querySelector("#nav-registro");
    const navUserItems = document.querySelectorAll(".nav-user-item");
    const navLogout = document.querySelector("#nav-logout");
    const { data: { session } } = await clienteSupabase.auth.getSession();
    
    if (session) {
        navUserItems.forEach(item => item.classList.remove('hidden'));
        navLogout?.classList.remove('hidden');
        actualizarContadorMensajesNoLeidos();
    } else {
        navLogin?.classList.remove('hidden');
        navRegistro?.classList.remove('hidden');
    }
    navElement?.classList.remove('nav-loading');
};

const actualizarContadorMensajesNoLeidos = async () => {
    const badge = document.getElementById('unread-count-badge');
    if (!badge) return;

    try {
        const { data, error } = await clienteSupabase.rpc('get_conversations_with_unread_count');
        if (error) throw error;
        
        const newTotal = data.reduce((sum, convo) => sum + convo.unread_count, 0);
        
        // Guardamos el recuento en nuestra variable global
        totalUnreadMessages = newTotal;
        
        actualizarBadgeUI(totalUnreadMessages);

    } catch (error) {
        console.error("Error al obtener contador de mensajes:", error);
        badge.classList.add('hidden');
    }
};

// AÑADE ESTA NUEVA FUNCIÓN PEQUEÑA (ayuda a no repetir código)
const actualizarBadgeUI = (count) => {
    const badge = document.getElementById('unread-count-badge');
    if (!badge) return;

    if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
};

window.addEventListener('updateUnreadCountOptimistic', (event) => {
    const { countToSubtract } = event.detail;
    totalUnreadMessages -= countToSubtract;
    if (totalUnreadMessages < 0) totalUnreadMessages = 0; // Prevenir números negativos
    actualizarBadgeUI(totalUnreadMessages);
});

const configurarBotonDeLogout = () => {
    const navLogout = document.querySelector("#nav-logout");
    if (!navLogout) return;
    navLogout.addEventListener('click', async (event) => {
        event.preventDefault();
        await clienteSupabase.auth.signOut();
        window.location.href = 'index.html';
    });
};


// =================================================================
// SECCIÓN 6: PUNTO DE ENTRADA DE LA APLICACIÓN (VERSIÓN LIMPIA)
// =================================================================
document.addEventListener('DOMContentLoaded', async () => {
    
     const loadComponents = async () => {
        const headerElement = document.querySelector('header');
        const footerElement = document.querySelector('footer');

        // Si existen los elementos, cargamos el contenido
        if (headerElement) {
            try {
                const response = await fetch('header.html');
                if (!response.ok) throw new Error('No se pudo cargar el header.');
                headerElement.innerHTML = await response.text();
            } catch (error) {
                console.error('Error cargando el header:', error);
                headerElement.innerHTML = '<p>Error al cargar el menú de navegación.</p>';
            }
        }

        if (footerElement) {
             try {
                const response = await fetch('footer.html');
                if (!response.ok) throw new Error('No se pudo cargar el footer.');
                footerElement.innerHTML = await response.text();
            } catch (error) {
                console.error('Error cargando el footer:', error);
                footerElement.innerHTML = '<p>Error al cargar el pie de página.</p>';
            }
        }
    };
    
    await loadComponents();
    
    // 1. Los scripts globales siempre se ejecutan
    await ejecutarScriptsGlobales();

    // 2. Obtenemos la página actual desde el atributo del body
    const currentPage = document.body.dataset.page;

    // 3. Ejecutamos solo el código específico de la página
    switch (currentPage) {
        case 'index':
             // La página de inicio usa la función importada para cargar las historias
            await fetchAndRenderStories(); 
            break;
        case 'explorar':
            await inicializarPaginaExplorar();
            break;
        case 'registro':
        case 'login':
            inicializarPaginasDeFormulario();
            break;
        case 'detalle-historia':
            await inicializarPaginaDetalleHistoria();
            break;
        case 'lectura':
            await inicializarPaginaDeLectura();
            break;
        case 'perfil':
            await inicializarPaginaDePerfil();
            break;
        case 'dashboard': 
            await inicializarDashboard();
            break;
        case 'editar-perfil':
            await inicializarPaginaEditarPerfil();
            break;
        case 'crear-entrada':
            await inicializarPaginaCrearEntrada();
            break;
        case 'crear-historia':
            await inicializarCrearHistoria();
            break;
        case 'gestion-historia':
            await inicializarGestionHistoria();
            break;
        case 'editar-capitulo':
            await inicializarEditarCapitulo();
            break;
        case 'mensajeria': 
            await inicializarPaginaMensajeria();
            break;
    }
    
    // 4. Hacemos visible el body cuando todo ha cargado
    document.body.classList.remove('body-loading');
});