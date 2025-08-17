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
import { inicializarPaginasDeHistorias } from './pages/storyGrid.js';
import { inicializarPaginaDetalleHistoria } from './pages/storyDetail.js';
import { inicializarPaginaDeLectura } from './pages/chapterReader.js';
import { inicializarPaginaDePerfil } from './pages/profile.js';
import { inicializarPaginaEditarPerfil } from './pages/profileEdit.js';
import { inicializarPaginaCrearEntrada } from './pages/entryCreate.js';
import { inicializarCrearHistoria, inicializarGestionHistoria, inicializarEditarCapitulo} from './pages/contentManagement.js';

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
    const navProfile = document.querySelector("#nav-profile");
    const navLogout = document.querySelector("#nav-logout");
    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (session) {
        navProfile?.classList.remove('hidden');
        navLogout?.classList.remove('hidden');
    } else {
        navLogin?.classList.remove('hidden');
        navRegistro?.classList.remove('hidden');
    }
    navElement?.classList.remove('nav-loading');
};

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
        case 'explorar':
            await inicializarPaginasDeHistorias();
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
    }
    
    // 4. Hacemos visible el body cuando todo ha cargado
    document.body.classList.remove('body-loading');
});