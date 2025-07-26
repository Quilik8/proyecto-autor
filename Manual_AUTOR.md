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

### Flujos de Usuario Clave

**1. Flujo de Nuevo Usuario (Registro y Primera Lectura):**
   - Un usuario llega a `index.html`.
   - Hace clic en "Registrarse" y va a `registro.html`.
   - Rellena el formulario, se crea la cuenta en Supabase y es redirigido a `confirmacion.html`.
   - El usuario va a su email, confirma su cuenta y vuelve a la web.
   - Ahora hace clic en "Iniciar Sesión" y va a `login.html`.
   - Introduce sus credenciales, se valida con Supabase y es redirigido a `index.html` con la sesión iniciada.
   - Navega a `explorar.html`, hace clic en una historia y llega a `historia.html`.
   - Hace clic en un capítulo y finalmente llega a `capitulo.html` para leer.

**2. Flujo de Creación de Contenido (Futuro - para el Autor):**
   - El autor inicia sesión.
   - Va a su `perfil.html` (que se convertirá en un panel de control).
   - Hace clic en "Crear Nueva Historia".
   - Rellena un formulario con el título, sinopsis y sube una portada.
   - Es redirigido a la página de gestión de esa historia, donde puede añadir y publicar nuevos capítulos.

**3. Flujo de Colaboración (Futuro - para el Gremio):**
   - Un autor busca un "Editor" en la sección del Gremio.
   - Contacta a un editor a través de la mensajería interna.
   - Le envía una propuesta de colaboración (ej. pago fijo o % de regalías).
   - El editor acepta. Ahora ambos ven la obra en sus paneles de control.

   ### Decisiones Arquitectónicas Clave

- **Stack Tecnológico Inicial (Front-End Estático):** Se eligió empezar con HTML, CSS y JavaScript puros (sin frameworks como React o Vue) para construir una base sólida, ligera y fácil de entender, manteniendo los costos en cero.
- **Backend-as-a-Service (BaaS):** Se eligió **Supabase** por las siguientes razones:
    - **Plan Gratuito Generoso:** Cubre todas las necesidades del MVP sin costo alguno.
    - **Base de Datos PostgreSQL:** Es una base de datos relacional estándar y potente, ideal para la estructura de usuarios, historias, capítulos y futuras transacciones.
    - **Autenticación Integrada:** Proporciona un sistema de registro, login y gestión de usuarios seguro y listo para usar, incluyendo la confirmación por email.
    - **Alternativa Open Source:** Ofrece más control y transparencia que otras opciones propietarias.
- **Alojamiento y Despliegue (Futuro):** La estrategia es usar **Netlify** o **Vercel** para el despliegue del front-end, por su integración perfecta con GitHub y sus generosos planes gratuitos.

### "Conocimiento Tribal" y Desafíos Inmediatos

- **Problemas de CSS y Caché:** Se experimentaron dificultades significativas con la memoria caché del navegador, que impedían ver los cambios de estilo. La solución estándar es siempre realizar una **Recarga Forzada (`Ctrl+F5` o `Cmd+Shift+R`)** antes de asumir un error en el código.
- **Evolución del Diseño:** El proyecto migró de un tema oscuro inicial a una identidad de marca de tema claro, más elegante y profesional. Los archivos actuales reflejan este nuevo diseño.
- **Próximo Gran Desafío (Backend):** La transición actual de una maqueta a una aplicación real. El siguiente paso crucial es dejar de usar datos de ejemplo (como las tarjetas de historias en el HTML) y empezar a leer y escribir desde la base de datos de Supabase. Esto implica:
    1.  Crear las tablas (`historias`, `capitulos`) en Supabase.
    2.  Modificar la página `explorar.html` para que obtenga la lista de historias desde la base de datos.
    3.  Construir los formularios que permitirán a los autores (una vez logueados) crear estas historias.

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
- [x] Misión 14: (Por definir: Mejorar diseño, añadir micro-interacciones, etc.)

**FASE 4: Backend y Base de Datos**
- [X] Misión 16: Elegir y configurar la tecnología Backend (Supabase).
- [X] Misión 17: Conectar el Front-End con Supabase (Instalar cliente y configurar claves API).
- [X] Misión 18: Implementar el registro de usuarios reales con Supabase Auth.
- [X] Misión 19: Implementar el inicio de sesión real y la gestión de sesión con Supabase.
- [ ] Misión 20: Crear la página de Perfil de Usuario y mostrar datos.

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
  ├── confirmacion.html
  ├── perfil.html
  ├── estilos.css
  ├── script.js
  └── Manual_AUTOR.md (Este mismo archivo)

- **Guía de Marca (Identidad Visual v2.0):**
  - **Paleta de Colores:**
    - **Fondo Principal:** Blanco Grisáceo (#DDDDDD)
    - **Texto Principal:** Negro Suave (#1a1a1a)
    - **Color de Acento:** Verde Esmeralda (#26DDC6)
    - **Color de Apoyo (Links, etc.):** Gris Oscuro (#333)
  - **Tipografía:**
    - **Títulos y Logo:** 'Playfair Display', serif
    - **Cuerpo de Texto y UI:** 'Roboto', sans-serif
    - **Texto de Lectura Larga:** 'Georgia', serif