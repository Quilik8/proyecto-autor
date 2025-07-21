// 1. Seleccionamos los dos elementos que necesitamos manipular
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector("nav"); // Seleccionamos la etiqueta nav

// 2. Creamos un "escuchador de eventos" para el clic en la hamburguesa
hamburger.addEventListener("click", () => {
    // Cuando se hace clic, alterna la clase 'active' en la hamburguesa y el menú
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});