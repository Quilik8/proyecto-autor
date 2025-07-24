# Manual del Proyecto A.U.T.O.R.
**Última actualización:** [Fecha de hoy]

---

## Parte 1: La Visión

### Filosofía y Propósito Central

El proyecto se llama **A.U.T.O.R.**, un acrónimo que define nuestros pilares:

-   **A**utonomía: El creador tiene control total sobre su obra y cómo la monetiza.
-   **U**niversal: Accesible para cualquier creador de cualquier parte del mundo. Empezamos en español, pero con visión global.
-   **T**alento: La plataforma está diseñada para recompensar el talento y el esfuerzo, no solo la popularidad previa.
-   **O**bras: El foco es la calidad y la diversidad de las obras, desde novelas seriadas hasta ensayos, y en el futuro, otros formatos.
-   **R**egalías: Un sistema de monetización transparente y justo es el núcleo del proyecto.

**El propósito** es simple: crear el "YouTube/Twitch de los escritores". Un lugar donde cualquiera pueda empezar a construir una carrera escribiendo, con herramientas de monetización y comunidad integradas desde el día uno.

### Visión a Largo Plazo y Fases de Expansión

El proyecto evolucionará en fases, expandiendo el tipo de contenido y las funcionalidades:

1.  **Fase Texto (Actual):** El MVP se centra en la ficción seriada y textos largos. El objetivo es consolidar la comunidad de lectores y escritores.
2.  **Fase Ecosistema ("El Gremio"):**
    *   **Mercado de Talentos:** Crear perfiles verificados para **Editores, Diseñadores, Traductores, etc.**
    *   **Colaboración Integrada:** Permitir a los autores contratar y colaborar con estos profesionales dentro de la plataforma.
    *   **Reparto de Ganancias Automatizado:** Un autor y un diseñador podrían acordar un reparto del 5% para la portada, y la plataforma gestionaría los pagos automáticamente.
3.  **Fase Multimedia:**
    *   **Audio:** Integración para audiolibros y podcasts narrativos.
    *   **Imagen:** Soporte para cómics, novelas ilustradas y galerías de arte conceptual.
    *   **Video:** Alojamiento de book-trailers, entrevistas con autores o cursos.

### Modelo de Negocio y Monetización Detallado

A.U.T.O.R. ofrecerá un conjunto flexible de herramientas de monetización para que el autor elija:

-   **Publicidad (Estilo YouTube):** Anuncios no intrusivos mostrados durante la lectura. Los ingresos se reparten entre la plataforma y el autor.
-   **Suscripción (Estilo Medium/Netflix):** Los lectores pagan una cuota mensual para una experiencia sin anuncios y acceso a contenido premium. Los ingresos de la suscripción se reparten entre los autores cuyas obras leen.
-   **Compra Directa (Paywall Flexible):**
    *   **Comprar la Obra Completa:** Pagar una vez para tener acceso perpetuo y sin anuncios a una historia.
    *   **Pago por Capítulo (Paywall Rodante):** El autor puede decidir que los últimos 1-3 capítulos sean de pago, y se vuelven gratuitos a medida que publica nuevos. Esto incentiva el apoyo de los fans más leales.
-   **Donaciones y Apoyo Directo (Estilo Patreon/Twitch):**
    *   **Donación por Párrafo:** Una "killer feature" donde los lectores pueden dejar una pequeña donación en un párrafo específico que les encantó.
    *   **Metas de Donación:** Los autores pueden establecer metas públicas (ej. "A los $100, publico un capítulo extra") para incentivar el apoyo comunitario.
    *   **Niveles de Mecenazgo:** Donaciones mensuales a cambio de recompensas definidas por el autor (acceso anticipado, menciones, contenido exclusivo).

### Gamificación y Retención de Usuarios

Para hacer la plataforma más atractiva y fomentar la participación:

-   **Para Lectores:** Ganar una "moneda virtual" por leer, entrar diariamente o ver anuncios, que luego pueden usar para donar o desbloquear contenido. Insignias por logros (terminar una saga, ser el primer donante, etc.).
-   **Para Autores:** "Misiones" para guiar su crecimiento ("Publica tu primera historia", "Consigue 10 seguidores") y recompensas por hitos de ingresos o publicación. El reparto de ganancias podría mejorar a medida que el autor crece en la plataforma.


---

## Parte 2: El Plan de Acción Maestro

**FASE 0: Cimientos y Estrategia**
- [X] Misión 1: Preparar el terreno (Instalar software, crear cuentas).
- [X] Misión 2: Construir el taller digital (Conectar VS Code con GitHub).

**FASE 1: Maquetación y Diseño Visual**
- [X] Misión 3: Estructura Semántica y Navegación.
- [X] Misión 4: Página de Inicio Atractiva.
- [X] Misión 5: Página de Registro.
- [X] Misión 6: Página de Inicio de Sesión.
- [X] Misión 7: Página de Exploración.
- [X] Misión 8: Página de Detalle de Historia.
- [X] Misión 9: Página de Lectura del Capítulo.

**FASE 2: Interactividad del Lado del Cliente**
- [X] Misión 10: Menú Responsivo (Hamburguesa) con JS.
- [X] Misión 11: Validación del Formulario de Registro con JS.
- [X] Misión 12: Validación del Formulario de Login con JS.
- [X] Misión 13: Simulación de Sesión de Usuario con `localStorage`.

**FASE 3: Pulido del Front-End**
- [ ] Misión 14: (Por definir: Mejorar diseño, añadir micro-interacciones, etc.)

**FASE 4: Backend y Base de Datos**
- [ ] (Aún no iniciada)

**FASE 5: El Gremio (Funcionalidad Central de Colaboración)**
- [ ]Misión 18: Ampliar los perfiles de usuario para incluir roles (Autor, Editor, Diseñador).
- [ ]Misión 19: Implementar un sistema de portafolios en los perfiles de los colaboradores.
- [ ]Misión 20: Construir un sistema de mensajería interna para la comunicación.
- [ ]Misión 21: Implementar un sistema de "contratos" simplificados y reparto de ganancias.

**FASE 6: Monetización**
- [ ]Misión 22: Integrar pasarelas de pago.
- [ ]Misión 23: Implementar las funciones de Paywall, Donaciones y Suscripciones.

---

## Parte 3: El Estado Técnico

- **Repositorio de GitHub:** [Pega aquí la URL de tu repositorio de GitHub]
- **Sitio de Pruebas en Netlify:** [Pega aquí la URL que te dio Netlify si decidiste publicar]

- **Estructura de Archivos:**
  proyecto-autor/
  ├── index.html
  ├── registro.html
  ├── login.html
  ├── explorar.html
  ├── historia.html
  ├── capitulo.html
  ├── estilos.css
  ├── script.js
  └── Manual_AUTOR.md (Este mismo archivo)

- **Guía de Marca (Resumen):**
  - **Color Principal (Verde A.U.T.O.R.):** #4CAF50
  - **Fondo Principal:** #1a1a1a
  - **Texto Principal:** #f0f0f0
  - **Fuente para Lectura:** 'Georgia', serif
  - **Fuente General:** sans-serif