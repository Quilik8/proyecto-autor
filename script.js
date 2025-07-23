// =================================================================
// SECCIÓN 1: LÓGICA DE SESIÓN Y NAVEGACIÓN
// Esta sección se encarga de todo lo relacionado con el estado de la sesión.
// La ponemos al principio porque debe ejecutarse en cada carga de página.
// =================================================================

// Seleccionamos los elementos del menú que vamos to a mostrar/ocultar
const navLogin = document.querySelector("#nav-login");
const navRegistro = document.querySelector("#nav-registro");
const navProfile = document.querySelector("#nav-profile");
const navLogout = document.querySelector("#nav-logout");

// Esta función revisa el 'localStorage' y actualiza el menú
function actualizarUINavegacion() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        // Si el usuario SÍ está logueado
        navLogin.classList.add('hidden');
        navRegistro.classList.add('hidden');
        navProfile.classList.remove('hidden');
        navLogout.classList.remove('hidden');
    } else {
        // Si el usuario NO está logueado
        navLogin.classList.remove('hidden');
        navRegistro.classList.remove('hidden');
        navProfile.classList.add('hidden');
        navLogout.classList.add('hidden');
    }
}

// Añadimos un "escuchador" al botón de "Cerrar Sesión"
if (navLogout) {
    navLogout.addEventListener('click', (event) => {
        event.preventDefault(); // Prevenimos que el enlace haga algo raro
        localStorage.removeItem('isLoggedIn'); // Borramos la "llave" de la sesión
        actualizarUINavegacion(); // Actualizamos el menú inmediatamente
        window.location.href = 'index.html'; // Mandamos al usuario a la página de inicio
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
// SECCIÓN 3: VALIDACIÓN DEL FORMULARIO DE LOGIN (MODIFICADO)
// Aquí es donde ocurre la magia de iniciar la sesión.
// =================================================================
const loginForm = document.querySelector("#login-form");

if (loginForm) {
    const emailInputLogin = document.querySelector("#login-email");
    const passwordInputLogin = document.querySelector("#login-password");
    const emailErrorLogin = document.querySelector("#login-email-error");
    const passwordErrorLogin = document.querySelector("#login-password-error");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        let esValido = true;
        emailErrorLogin.textContent = "";
        passwordErrorLogin.textContent = "";

        if (emailInputLogin.value.trim() === "") {
            emailErrorLogin.textContent = "El correo electrónico es obligatorio.";
            esValido = false;
        }
        if (passwordInputLogin.value.trim() === "") {
            passwordErrorLogin.textContent = "La contraseña es obligatoria.";
            esValido = false;
        }

        if (esValido) {
            // ¡ESTA ES LA MODIFICACIÓN CLAVE!
            // En lugar de una alerta, ahora guardamos el estado en el navegador
            localStorage.setItem('isLoggedIn', 'true'); 
            // Y redirigimos al usuario a la página de inicio
            window.location.href = 'index.html'; 
        }
    });
}


// =================================================================
// SECCIÓN 4: VALIDACIÓN DEL FORMULARIO DE REGISTRO
// Esta es la lógica que ya teníamos, sin cambios.
// =================================================================
const registroForm = document.querySelector("#registro-form");

if (registroForm) {
    const usernameInput = document.querySelector("#username");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const usernameError = document.querySelector("#username-error");
    const emailError = document.querySelector("#email-error");
    const passwordError = document.querySelector("#password-error");
    
    registroForm.addEventListener("submit", (event) => {
        event.preventDefault(); 
        let esValido = true;
        usernameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";

        if (usernameInput.value.trim() === "") {
            usernameError.textContent = "El nombre de usuario es obligatorio.";
            esValido = false;
        }
        if (emailInput.value.trim() === "") {
            emailError.textContent = "El correo electrónico es obligatorio.";
            esValido = false;
        }
        if (passwordInput.value.length < 8) {
            passwordError.textContent = "La contraseña debe tener al menos 8 caracteres.";
            esValido = false;
        }

        if (esValido) {
            alert("¡Formulario enviado con éxito! (Simulación)");
            registroForm.submit();
        }
    });
}