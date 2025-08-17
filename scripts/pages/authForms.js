// Importamos las dependencias que necesita esta página
import { clienteSupabase } from '../supabaseClient.js';
import { toggleFormButtonState } from '../helpers.js';

// Exportamos la función principal de este módulo
export const inicializarPaginasDeFormulario = () => {
    const registroForm = document.querySelector("#registro-form");
    if (registroForm) {
        registroForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitButton = registroForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            toggleFormButtonState(submitButton, true); // Deshabilitamos el botón

            const username = document.querySelector("#username").value;
            const email = document.querySelector("#email").value;
            const password = document.querySelector("#password").value;
            const generalError = document.querySelector("#general-error");
            generalError.textContent = "";

            try {
                const { error } = await clienteSupabase.auth.signUp({ email, password, options: { data: { username } } });
                if (error) throw error;
                window.location.href = 'confirmacion.html';
            } catch (error) {
                generalError.textContent = "Error en el registro: " + error.message;
                toggleFormButtonState(submitButton, false, originalButtonText); // Rehabilitamos si hay error
            }
        });
    }

    const loginForm = document.querySelector("#login-form");
     if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            toggleFormButtonState(submitButton, true); // Deshabilitamos el botón

            const email = document.querySelector("#login-email").value;
            const password = document.querySelector("#login-password").value;
            const generalError = document.querySelector("#login-general-error");
            generalError.textContent = "";
            try {
                const { error } = await clienteSupabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                window.location.href = 'index.html';
            } catch (error) {
                generalError.textContent = "Correo o contraseña incorrectos.";
                toggleFormButtonState(submitButton, false, originalButtonText); // Rehabilitamos si hay error
            }
        });
    }
};