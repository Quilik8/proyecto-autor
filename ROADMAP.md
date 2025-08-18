# Roadmap y Plan de Acción de A.U.T.O.R.
**Última actualización:** Agosto 2025

Este documento contiene el plan de desarrollo maestro para el proyecto, dividido en fases y misiones, así como un registro de los cambios y funcionalidades implementadas.

---

## 1. Plan de Acción Maestro

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
- [X] Misión 14: Mejorar la experiencia de usuario y el diseño visual (Tipografía, etc.).
- [X] Misión 15: Implementar Selector de Tema (Modo Claro/Oscuro).

**FASE 4: Backend y Base de Datos**
- [X] Misión 16: Elegir y configurar la tecnología Backend (Supabase).
- [X] Misión 17: Conectar el Front-End con Supabase.
- [X] Misión 18: Implementar el registro de usuarios reales con Supabase Auth.
- [X] Misión 19: Implementar el inicio de sesión real y la gestión de sesión.
- [X] Misión 20: Crear la página de Perfil de Usuario y mostrar datos.
- [X] Misión 21: Diseñar y crear las tablas de la base de datos (perfiles, historias, capitulos).
- [X] Misión 22: Construir el Panel de Gestión de Contenido del Autor.
- [X] Misión 23: Implementar Políticas de Seguridad a Nivel de Fila (RLS).

**FASE 4.5: Misión de Pulido Final y Comunidad**
- [X] Misión 24: Completar la funcionalidad del Perfil de Usuario (Edición, Avatar, Borrado).
- [X] Misión 25: Refinar la Experiencia de Usuario (UX).
- [X] Misión 26: Gestión de Portadas de Historias.
- [X] Misión 27: Implementar perfiles de usuario con roles seleccionables.
- [X] Misión 28: Implementar Perfiles Públicos.
- [X] Misión Intermedia: La Bitácora del Creador (MVP).

**FASE 5: El Gremio - El Mercado de Talentos (En Proceso)**
- [X] **Misión 29:** Construir un sistema de portafolios y de reseñas entre usuarios.
- [X] **Misión 30:** Implementar un sistema de búsqueda y filtros para encontrar colaboradores.
- [ ] **Misión 31:** Construir la mensajería interna.
- [ ] **Misión 32:** Implementar sistema de "contratos" simplificados y reparto de ganancias.

**FASE 6: El Ecosistema de Progreso y Comunidad**
- [ ] **Misión 32 (Hub Comunitario):** Implementar un sistema de foros integrado.
- [ ] **Misión 33 (Sistema de Progreso Global):** Diseñar e implementar la base de datos y la lógica para XP y Moneda Virtual.
- [ ] **Misión 34 (Economía Virtual):** Construir la "tienda" y la Biblioteca Premium.

**FASE 7: Curación de Contenido**
- [ ] **Misión: Obras Destacadas.** Implementar la funcionalidad para que un creador/admin pueda destacar obras en la página de inicio.

**FASE 8: Monetización**
- [ ] Misión A: Integrar pasarela de pago.
- [ ] Misión B: Implementar Donaciones.
- [ ] Misión C: Construir Compra Directa y Paywall Flexible.
- [ ] Misión D: Crear el sistema de Suscripción Global (A.U.T.O.R.+).
- [ ] Misión E: Integrar Publicidad.

**FASE 9: Herramientas de Contenido**
- [ ] **Misión: Ingesta Masiva de Contenido.** Crear un script de Node.js para poblar la base de datos con obras de dominio público.

**FASE 10: Internacionalización**
- [ ] Misión A: Traducción de la Interfaz (UI).
- [ ] Misión B: Soporte de Contenido Multilingüe.
- [ ] Misión C: Traducción Colaborativa (Integración con El Gremio).

## 2. Contexto Histórico y Lecciones Aprendidas

Esta sección documenta decisiones estratégicas y desafíos encontrados durante las primeras fases del desarrollo, proporcionando un contexto clave para entender la evolución listada en el historial de cambios.

*   **Revisión de la Experiencia de Usuario Inicial (UX v2.0):**
    *   **Página de Inicio Centrada en el Contenido:** Se decidió eliminar la sección "hero" (el gran titular de bienvenida). La página de inicio ahora muestra directamente una selección de historias destacadas para sumergir al usuario en el catálogo desde el primer momento.
    *   **Barra de Búsqueda Global:** La funcionalidad de búsqueda se integró directamente en el encabezado (`header`), permitiendo al usuario iniciar una búsqueda desde cualquier punto de la web, mejorando la usabilidad.

*   **"Conocimiento Tribal" y Desafíos Técnicos:**
    *   **Problemas de CSS y Caché:** Se experimentaron dificultades recurrentes con la caché del navegador que impedían ver los cambios de estilo. La solución estándar es siempre realizar una **Recarga Forzada (`Ctrl+F5` o `Cmd+Shift+R`)** antes de asumir un error en el código.
    *   **Evolución del Diseño:** El proyecto migró de un tema oscuro inicial a una identidad de marca de tema claro, más elegante y profesional.
    *   **Reconstrucción del CSS (v5.0):** Tras encontrar conflictos de responsividad y diseño inconsistente, se reconstruyó por completo el archivo `estilos.css`. La nueva versión se estructuró en partes lógicas (Fundamentos, Estructura, Componentes, etc.), eliminando código redundante y solucionando problemas de layout.

## 2. Historial de Cambios (Changelog)

Registro de las principales fases de desarrollo y mejoras arquitectónicas completadas.

### Versión 1.0 a 4.5 (Fundamentos y MVP) - Agosto 2025
- Se completaron las FASES 0 a 4.5 del plan de acción.
- Se construyó la maquetación estática completa de la plataforma.
- Se implementó la interactividad básica con JavaScript.
- Se integró Supabase para la gestión de backend (autenticación, base de datos, storage).
- Se desarrollaron todas las funcionalidades del Producto Mínimo Viable (MVP), incluyendo registro, login, perfiles públicos/privados, creación y gestión de historias/capítulos, y la Bitácora del creador.
- Se implementaron políticas de seguridad (RLS) en todas las tablas y buckets.

### Versión 5.1 (Refinamiento Estructural) - Agosto 2025
- **Centralización de Componentes:** Se refactorizó el código del `Header` y `Footer` para ser cargados dinámicamente desde archivos externos, eliminando la duplicación de código.
- **Mejoras Funcionales y de UX:** Se reparó y completó la funcionalidad del editor de capítulos, se implementó la navegación entre capítulos y se mejoró la retroalimentación visual en los formularios de login/registro.

### Versión 6.0 (Arquitectura Modular) - Agosto 2025
- Se llevó a cabo una refactorización completa del código JavaScript, migrando de un archivo monolítico a una arquitectura de módulos ES (`import`/`export`). El código fue organizado por responsabilidad en una nueva estructura de archivos bajo el directorio `/scripts`.

### Versión 7.0 (Inicio de FASE 5: El Gremio) - Agosto 2025
- Se inició el desarrollo de la FASE 5: El Gremio de Talentos.
- Se estableció la infraestructura de backend necesaria en Supabase, incluyendo las nuevas tablas `portfolio_items`, `reviews` y `collaborations` con sus respectivas políticas de seguridad (RLS).

### Versión 7.1 (Infraestructura del Gremio) - Agosto 2025
- **Reestructuración de la Interfaz:** Se separó la página de perfil (`perfil.html`) del nuevo panel de gestión del usuario (`dashboard.html`) para clarificar los flujos de usuario.
- **Implementación de Propuestas:** Se implementó la primera funcionalidad del Gremio: la capacidad de proponer colaboraciones a otros usuarios a través de un modal en la página de perfil, guardando el registro en la base de datos.

### Versión 7.2 (Misión 29 Completada: Portafolios y Reseñas) - Agosto 2025
- Se ha finalizado la primera gran misión del Gremio de Talentos.
- **Portafolios:** Los usuarios ahora pueden añadir, editar y borrar ítems de trabajo en una nueva pestaña "Portafolio" en su perfil público.
- **Ciclo de Colaboración:** Se implementó el flujo completo de colaboración: un autor puede proponer una colaboración a otro usuario, el colaborador puede aceptar/rechazar la propuesta, y el autor puede marcarla como completada.
- **Reseñas Transaccionales:** Una vez que una colaboración se marca como "completada", ambas partes pueden dejarse una reseña mutua. Estas reseñas se muestran públicamente en la nueva pestaña "Reseñas" del perfil, vinculadas a un trabajo real y verificado.

### Versión 7.3 (Misión 30 Completada: El Gremio Dinámico) - Agosto 2025
- Se ha finalizado la Misión 30, creando el motor de búsqueda para "El Gremio".
- Se implementó la búsqueda de perfiles por nombre de usuario y por roles (predefinidos y personalizados).
- Se refactorizó la página `explorar.html` para convertirla en una aplicación de pestañas dinámicas, unificando la exploración de Historias y del Gremio en un solo lugar.
- Se consolidó la lógica de JavaScript, eliminando los archivos `gremio.html` y `gremio.js` y creando un nuevo controlador `explorarPage.js`.

## 3. Estrategia de Aplicación Móvil

La creación de una aplicación nativa se contempla como una fase avanzada del proyecto. La estrategia se divide en tres etapas claras:

1.  **Etapa 1 (Actual): Perfeccionamiento de la Web Responsiva.** El objetivo principal es asegurar que la experiencia de usuario en navegadores móviles sea impecable, cubriendo todas las funcionalidades clave de la plataforma.
2.  **Etapa 2 (Post-Lanzamiento): Implementación de PWA (Progressive Web App).** Mejorar el sitio web actual para que sea "instalable" en la pantalla de inicio de los móviles, pueda funcionar offline y enviar notificaciones, ofreciendo una experiencia muy similar a una app nativa con un costo de desarrollo mucho menor.
3.  **Etapa 3 (Fase de Crecimiento): Desarrollo de la Aplicación Nativa.** Una vez que A.U.T.O.R. demuestre tener una base de usuarios activa y/o genere ingresos, se evaluará la contratación de un equipo o freelancer especializado para el desarrollo de las aplicaciones nativas para iOS y Android.