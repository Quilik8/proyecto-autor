// 1. Seleccionamos los dos elementos que necesitamos manipular
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector("nav"); // Seleccionamos la etiqueta nav

// 2. Creamos un "escuchador de eventos" para el clic en la hamburguesa
hamburger.addEventListener("click", () => {
    // Cuando se hace clic, alterna la clase 'active' en la hamburguesa y el menú
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});// --- VALIDACIÓN DEL FORMULARIO DE REGISTRO ---

// 1. Seleccionar los elementos del DOM (Document Object Model)
const registroForm = document.querySelector("#registro-form");
const usernameInput = document.querySelector("#username");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

const usernameError = document.querySelector("#username-error");
const emailError = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error");

// 2. Escuchar el evento "submit" del formulario
if (registroForm) { // Solo ejecuta este código si estamos en la página de registro
    registroForm.addEventListener("submit", (event) => {
        // Previene que el formulario se envíe y la página se recargue
        event.preventDefault(); 
        
        let esValido = true;

        // Limpiar errores previos
        usernameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";

        // Validación del nombre de usuario
        if (usernameInput.value.trim() === "") {
            usernameError.textContent = "El nombre de usuario es obligatorio.";
            esValido = false;
        }

        // Validación del email
        if (emailInput.value.trim() === "") {
            emailError.textContent = "El correo electrónico es obligatorio.";
            esValido = false;
        } // Podríamos añadir una validación de formato de email más compleja aquí

        // Validación de la contraseña
        if (passwordInput.value.length < 8) {
            passwordError.textContent = "La contraseña debe tener al menos 8 caracteres.";
            esValido = false;
        }

        // 3. Si todo es válido, podríamos enviar el formulario
        if (esValido) {
            alert("¡Formulario enviado con éxito! (Simulación)");
            // Aquí, en el futuro, iría el código para enviar los datos a un servidor.
            registroForm.submit(); // Por ahora, lo enviamos para que veas la acción
        }
    });
}