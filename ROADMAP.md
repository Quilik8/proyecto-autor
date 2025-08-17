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
- [x] **Misión 29:** Construir un sistema de portafolios y de reseñas entre usuarios.
- [ ] **Misión 30:** Implementar un sistema de búsqueda y filtros para encontrar colaboradores.
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