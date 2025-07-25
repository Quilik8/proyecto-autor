// =================================================================
// SECCIÓN 1: GESTIÓN DE LA SESIÓN DE USUARIO REAL
// =================================================================

// Seleccionamos los elementos del menú
const navLogin = document.querySelector("#nav-login");
const navRegistro = document.querySelector("#nav-registro");
const navProfile = document.querySelector("#nav-profile");
const navLogout = document.querySelector("#nav-logout");

// Función para actualizar la UI basada en el estado de la sesión de Supabase
const actualizarUINavegacion = async () => {
    // Le preguntamos a Supabase por la sesión actual
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Si hay una sesión activa (el usuario está logueado)
        navLogin.classList.add('hidden');
        navRegistro.classList.add('hidden');
        navProfile.classList.remove('hidden');
        navLogout.classList.remove('hidden');
    } else {
        // Si no hay sesión
        navLogin.classList.remove('hidden');
        navRegistro.classList.remove('hidden');
        navProfile.classList.add('hidden');
        navLogout.classList.add('hidden');
    }
};

// Añadimos un "escuchador" al botón de "Cerrar Sesión"
if (navLogout) {
    navLogout.addEventListener('click', async (event) => {
        event.preventDefault();
        // Le pedimos a Supabase que cierre la sesión
        const { error } = await supabase.auth.signOut();
        if (!error) {
            // Si el cierre de sesión es exitoso, actualizamos la UI y redirigimos
            actualizarUINavegacion();
            window.location.href = 'index.html';
        }
    });
}

// Le decimos al navegador que ejecute nuestra función tan pronto como el HTML esté listo
document.addEventListener('DOMContentLoaded', actualizarUINavegacion);


// =================================================================
// SECCIÓN 2: MENÚ HAMBURGUESA
// Esta es la lógica que ya teníamos para el menú en móviles.
// =================================================================
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector("nav");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});


// =================================================================
// SECCIÓN 3: INICIO DE SESIÓN REAL CON SUPABASE
// =================================================================
const loginForm = document.querySelector("#login-form");

if (loginForm) {
    // Seleccionamos todos los elementos necesarios
    const emailInputLogin = document.querySelector("#login-email");
    const passwordInputLogin = document.querySelector("#login-password");
    const emailErrorLogin = document.querySelector("#login-email-error");
    const passwordErrorLogin = document.querySelector("#login-password-error");
    const generalErrorLogin = document.querySelector("#login-general-error");

    // Hacemos la función del evento "async" para poder usar "await"
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Limpiar errores previos
        emailErrorLogin.textContent = "";
        passwordErrorLogin.textContent = "";
        generalErrorLogin.textContent = "";

        // --- Validación del lado del cliente (rápida) ---
        let esValido = true;
        if (emailInputLogin.value.trim() === "" || !emailInputLogin.value.includes('@')) {
            emailErrorLogin.textContent = "Por favor, introduce un correo válido.";
            esValido = false;
        }
        if (passwordInputLogin.value.trim() === "") {
            passwordErrorLogin.textContent = "La contraseña es obligatoria.";
            esValido = false;
        }

        if (!esValido) {
            return;
        }

        // --- Autenticación con Supabase ---
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailInputLogin.value,
                password: passwordInputLogin.value,
            });

            if (error) {
                // Si Supabase devuelve un error (ej. credenciales inválidas)
                console.error("Error de Supabase:", error.message);
                generalErrorLogin.textContent = "Correo o contraseña incorrectos.";
                return;
            }

            // ¡ÉXITO! El usuario ha iniciado sesión.
            // No necesitamos guardar en localStorage. Supabase lo hace automáticamente
            // en una cookie segura. Redirigimos al inicio.
            window.location.href = 'index.html';

        } catch (catchError) {
            // Por si hay un error de red o algo inesperado
            generalErrorLogin.textContent = "Ocurrió un error inesperado. Inténtalo de nuevo.";
            console.error("Error en el inicio de sesión: ", catchError);
        }
    });
}


// =================================================================
// SECCIÓN 4: VALIDACIÓN DEL FORMULARIO DE REGISTRO (CON SUPABASE)
// =================================================================
const registroForm = document.querySelector("#registro-form");

if (registroForm) {
    // Seleccionamos todos los elementos necesarios del formulario
    const usernameInput = document.querySelector("#username");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");

    const usernameError = document.querySelector("#username-error");
    const emailError = document.querySelector("#email-error");
    const passwordError = document.querySelector("#password-error");
    const generalError = document.querySelector("#general-error");

    // Hacemos la función del evento "async" para poder usar "await"
    registroForm.addEventListener("submit", async (event) => { 
        event.preventDefault(); 
        
        // Limpiar errores previos
        usernameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";
        if (generalError) generalError.textContent = "";

        // --- Validación del lado del cliente (rápida) ---
        let esValido = true;
        if (usernameInput.value.trim() === "") {
            usernameError.textContent = "El nombre de usuario es obligatorio.";
            esValido = false;
        }
        if (emailInput.value.trim() === "" || !emailInput.value.includes('@')) {
            emailError.textContent = "Por favor, introduce un correo válido.";
            esValido = false;
        }
        if (passwordInput.value.length < 8) {
            passwordError.textContent = "La contraseña debe tener al menos 8 caracteres.";
            esValido = false;
        }

        // Si la validación rápida falla, no continuamos.
        if (!esValido) return; 

        // --- Envío a Supabase (si todo es válido) ---
        try {
            // Usamos el cliente de Supabase que creamos en config.js
            const { data, error } = await supabase.auth.signUp({
                email: emailInput.value,
                password: passwordInput.value,
                options: {
                    data: {
                        username: usernameInput.value
                    }
                }
            });

            if (error) {
                // Si Supabase devuelve un error (ej. usuario ya existe)
                if (generalError) generalError.textContent = "Error: " + error.message;
            } else {
                // Si el registro es exitoso
                window.location.href = 'confirmacion.html'; // Redirigimos a la página de confirmación
            }

        } catch (catchError) {
            // Por si hay un error de red o algo inesperado
            if (generalError) generalError.textContent = "Ocurrió un error inesperado. Inténtalo de nuevo.";
            console.error("Error en el registro: ", catchError);
        }
    });
}