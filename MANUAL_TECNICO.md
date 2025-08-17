# Manual Técnico de A.U.T.O.R.
**Última actualización:** Agosto 2025

Este documento describe la arquitectura, la configuración y el estado técnico actual del proyecto A.U.T.O.R. Está destinado a servir como una guía de referencia para el desarrollo y mantenimiento de la plataforma.

---

## 1. Arquitectura General y Stack Tecnológico

La plataforma se ha desarrollado siguiendo un enfoque de "Jamstack" progresivo, priorizando la simplicidad, la escalabilidad y los bajos costos operativos durante las fases iniciales.

### 1.1. Stack Tecnológico Principal

*   **Frontend:** HTML5, CSS3, JavaScript (ECMAScript 2015+).
*   **Backend:** Supabase (Backend-as-a-Service).
*   **Base de Datos:** PostgreSQL (gestionada a través de Supabase).
*   **Control de Versiones:** Git y GitHub.

### 1.2. Decisiones Arquitectónicas Clave

1.  **Frontend sin Frameworks:** Se optó por utilizar JavaScript "vanilla" (puro) en lugar de un framework como React o Vue.
    *   **Razón:** Para construir una base de código ligera, sin dependencias externas complejas, y para tener un control total sobre el rendimiento y la estructura. Esto asegura que los fundamentos del proyecto sean sólidos antes de considerar abstracciones de nivel superior.

2.  **Backend-as-a-Service (BaaS) con Supabase:** Se eligió Supabase para gestionar toda la infraestructura del backend.
    *   **Razón:** El generoso plan gratuito de Supabase cubre todas las necesidades del proyecto en sus etapas iniciales y medias. Proporciona una base de datos PostgreSQL completa, un sistema de autenticación robusto, almacenamiento de archivos y APIs auto-generadas, lo que acelera drásticamente el desarrollo al eliminar la necesidad de construir y mantener un servidor propio.

3.  **Sistema de Ejecución por Página (Modular):** Para optimizar la carga y la organización del código, el frontend utiliza un sistema de enrutamiento basado en módulos.
    *   **Implementación:** Cada página HTML principal tiene un atributo `data-page` en su etiqueta `<body>` (ej. `<body data-page="perfil">`). El punto de entrada `scripts/main.js` lee este atributo y, utilizando una estructura `switch`, importa y ejecuta dinámicamente solo el módulo de JavaScript requerido para esa página específica.

## 2. Estructura del Frontend

El código del lado del cliente está organizado en una estructura de archivos clara para facilitar el mantenimiento y la escalabilidad.

### 2.1. Estructura de Carpetas y Archivos

/
|-- css/
| |-- estilos.css
|-- scripts/
| |-- pages/
| | |-- authForms.js
| | |-- chapterReader.js
| | |-- contentManagement.js
| | |-- dashboard.js
| | |-- entryCreate.js
| | |-- profile.js
| | |-- profileEdit.js
| | |-- storyDetail.js
| | |-- storyGrid.js
| |-- helpers.js
| |-- main.js
| |-- supabaseClient.js
| |-- ui.js
|-- header.html
|-- footer.html
|-- index.html
|-- perfil.html
|-- (resto de archivos .html)


### 2.2. Descripción de Componentes Clave

*   **`/*.html`**: Cada archivo representa una página o vista principal de la aplicación. Utilizan el atributo `data-page` en el `<body>` para identificarse ante el sistema de scripts.

*   **`header.html` y `footer.html`**: Son componentes reutilizables que contienen el HTML del encabezado y pie de página. Se inyectan dinámicamente en cada página a través de `main.js` para evitar la duplicación de código.

*   **`/css/estilos.css`**: Única hoja de estilos del proyecto. Utiliza variables CSS para gestionar los temas claro y oscuro y está estructurada de forma lógica para cubrir desde los fundamentos hasta los componentes específicos.

*   **`/scripts/main.js`**: El punto de entrada de la aplicación. Sus responsabilidades son:
    1.  Cargar los componentes `header.html` y `footer.html`.
    2.  Ejecutar scripts globales (UI, autenticación).
    3.  Leer el `data-page` de la página actual.
    4.  Importar y ejecutar el módulo de JavaScript correspondiente desde la carpeta `/pages`.

*   **`/scripts/pages/*.js`**: Módulos especializados. Cada archivo contiene la lógica de JavaScript específica para una página o un conjunto de funcionalidades relacionadas (ej. `profile.js` maneja la página de perfil, `contentManagement.js` maneja la creación y edición de obras).

*   **`/scripts/ui.js`**: Contiene la lógica para los componentes de la interfaz de usuario que son globales y se encuentran en todas las páginas, como el menú hamburguesa, el selector de tema y la barra de búsqueda.

*   **`/scripts/supabaseClient.js`**: Archivo dedicado exclusivamente a la inicialización y exportación de la instancia del cliente de Supabase.

*   **`/scripts/helpers.js`**: Módulo que contiene funciones de ayuda genéricas y reutilizables, como `toggleFormButtonState`, para ser usadas por cualquier otro módulo que las necesite.

## 3. Configuración del Backend (Supabase)

Toda la infraestructura del backend, incluyendo la base de datos, autenticación, almacenamiento y seguridad, es gestionada a través de Supabase.

### 3.1. Estructura de la Base de Datos

La base de datos PostgreSQL se organiza en las siguientes tablas principales dentro del `schema public`. RLS (Row Level Security) está activado en todas ellas.

**Tabla: `profiles`**
- **Propósito:** Almacena los datos públicos y editables de los usuarios, extendiendo la tabla `auth.users`.
- **Columnas Clave:**
    - `id` (uuid, PK): Vinculada a `auth.users.id`.
    - `username` (text): Nombre de usuario público.
    - `bio` (text): Biografía del usuario.
    - `avatar_url` (text): Enlace al avatar en Supabase Storage.
    - `roles` (array de text): Almacena los roles del Gremio (ej. "Autor", "Editor").

**Tabla: `stories`**
- **Propósito:** Almacena la información principal de cada obra.
- **Columnas Clave:**
    - `id` (bigint, PK): ID numérico autoincremental.
    - `author_id` (uuid, FK): Referencia a `profiles.id`.
    - `title` (text): Título de la obra.
    - `synopsis` (text): Resumen de la obra.
    - `cover_image_url` (text): Enlace a la portada en Supabase Storage.

**Tabla: `chapters`**
- **Propósito:** Almacena el contenido de cada capítulo individual.
- **Columnas Clave:**
    - `id` (uuid, PK): ID único del capítulo.
    - `story_id` (bigint, FK): Referencia a `stories.id`.
    - `title` (text): Título del capítulo.
    - `content` (text): Cuerpo del capítulo.
    - `status` (text): Estado del capítulo (ej. 'borrador', 'publicado').

**Tabla: `bitacora`**
- **Propósito:** Almacena el contenido editorial (Apuntes y Artículos) de los usuarios.
- **Columnas Clave:**
    - `id` (bigint, PK): ID numérico.
    - `author_id` (uuid, FK): Referencia a `profiles.id`.
    - `type` (text): 'apunte' o 'articulo'.
    - `title` (text): Requerido para artículos.
    - `content` (text): Cuerpo de la entrada.

**Tabla: `portfolio_items`**
- **Propósito:** Almacena los trabajos individuales del portafolio de un usuario.
- **Columnas Clave:**
    - `id` (uuid, PK): ID único del ítem.
    - `user_id` (uuid, FK): Referencia a `profiles.id`.
    - `title` (text): Título del trabajo.
    - `description` (text): Descripción del trabajo.

**Tabla: `reviews`**
- **Propósito:** Almacena las reseñas transaccionales entre usuarios.
- **Columnas Clave:**
    - `id` (uuid, PK): ID único de la reseña.
    - `reviewer_id` (uuid, FK): Referencia a `profiles.id` (quien escribe).
    - `reviewee_id` (uuid, FK): Referencia a `profiles.id` (quien recibe).
    - `collaboration_id` (uuid, FK): Referencia a `collaborations.id`.
    - `rating` (int4): Valoración numérica.

**Tabla: `collaborations`**
- **Propósito:** Registra los acuerdos de trabajo entre usuarios para una obra.
- **Columnas Clave:**
    - `id` (uuid, PK): ID único del acuerdo.
    - `story_id` (bigint, FK): Referencia a `stories.id`.
    - `author_id` (uuid, FK): Referencia a `profiles.id`.
    - `collaborator_id` (uuid, FK): Referencia a `profiles.id`.
    - `status` (text): Estado del acuerdo (ej. 'propuesto', 'aceptado').

### 3.2. Automatización (Triggers y Funciones de Base de Datos)

Se ha implementado un trigger para automatizar la creación de perfiles.
*   **Función:** `public.handle_new_user()`
*   **Disparador (Trigger):** `on_auth_user_created`
*   **Acción:** Se ejecuta `AFTER INSERT ON auth.users`. La función inserta automáticamente una nueva fila en `public.profiles` utilizando el `id` y los metadatos del nuevo usuario, asegurando que cada cuenta de autenticación tenga un perfil correspondiente desde el momento del registro.

### 3.3. Almacenamiento de Archivos (Supabase Storage)

Se utilizan dos buckets públicos para gestionar los archivos subidos por los usuarios.
*   **Bucket `avatars`:** Almacena las imágenes de perfil. Las políticas de seguridad restringen la escritura a carpetas nombradas con el `user_id` del usuario autenticado.
*   **Bucket `covers`:** Almacena las portadas de las historias. Las políticas de seguridad vinculan los permisos de escritura al `author_id` de la historia correspondiente en la tabla `stories`.

### 3.4. Resumen de Políticas de Seguridad (RLS)

-   **Acceso Público (SELECT):** Generalmente permitido para el contenido destinado a ser visto por todos (`profiles`, `stories`, `chapters` publicados, `bitacora`, `portfolio_items`, `reviews`).
-   **Creación (INSERT):** Los usuarios solo pueden crear contenido asociándolo a su propio `user_id` (`bitacora`, `portfolio_items`). Para las colaboraciones, solo el autor puede iniciarla. Para las reseñas, se requiere una colaboración completada.
-   **Modificación (UPDATE / DELETE):** Las reglas son estrictas. Un usuario solo puede modificar o borrar el contenido que le pertenece. La propiedad se verifica comparando el `auth.uid()` con la columna `author_id` o `user_id` de la fila correspondiente. Las colaboraciones tienen reglas específicas según su estado.```

## 4. Guía de Estilo y Marca

Esta sección define los elementos visuales clave de la plataforma A.U.T.O.R. para mantener una identidad de marca consistente.

### 4.1. Paleta de Colores

La plataforma utiliza un sistema de temas claro/oscuro gestionado a través de variables CSS.

#### Tema Claro (Por Defecto)

*   `--bg-color`: `#f0f2f5` (Fondo principal, un gris muy claro)
*   `--bg-color-light`: `#ffffff` (Fondo de paneles, tarjetas y modales)
*   `--text-color`: `#1a1a1a` (Texto principal, negro suave)
*   `--text-color-secondary`: `#555555` (Texto secundario, gris oscuro)
*   `--primary-color`: `#26DDC6` (Color de acento principal para botones y enlaces)
*   `--border-color`: `#e0e0e0` (Color para bordes y separadores)

#### Tema Oscuro (`.dark-mode`)

*   `--bg-color`: `#1a1a1a` (Fondo principal, negro suave)
*   `--bg-color-light`: `#2c2c2c` (Fondo de paneles, tarjetas)
*   `--text-color`: `#f0f0f0` (Texto principal, blanco grisáceo)
*   `--text-color-secondary`: `#aaaaaa` (Texto secundario, gris claro)
*   `--primary-color`: `#26DDC6` (El acento principal se mantiene)
*   `--border-color`: `#444444` (Color para bordes y separadores)

### 4.2. Tipografía

Se utilizan dos fuentes principales de Google Fonts para crear una jerarquía visual clara.

*   **Títulos y Logo:** `Playfair Display` (Serif)
    *   **Uso:** Para `<h1>`, `<h2>`, `<h3>` y el logo. Proporciona un carácter elegante y editorial.
*   **Cuerpo de Texto y UI:** `Roboto` (Sans-serif)
    *   **Uso:** Para párrafos, etiquetas, botones y todos los demás elementos de la interfaz. Asegura una excelente legibilidad en pantalla.
*   **Texto de Lectura Larga:** `Georgia` (Serif)
    *   **Uso:** Específicamente para el contenido de los capítulos (`#chapter-content-article`), para una experiencia de lectura más cómoda y tradicional.