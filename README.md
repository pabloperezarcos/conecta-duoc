# ConectaDuoc
ConectaDuoc es una plataforma web desarrollada con **Angular 20** que permite a estudiantes y administradores de Duoc UC publicar avisos, compartir actividades y gestionar reportes dentro de distintas categorías. El proyecto se autentica mediante Azure AD y consume un backend REST (no incluido en este repositorio) para todas sus operaciones.

## Índice
1. [Instalación](#instalacion)
2. [Ejecución](#ejecucion)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Módulos y componentes](#modulos-y-componentes)
5. [Servicios y utilidades](#servicios-y-utilidades)
6. [Rutas principales](#rutas-principales)
7. [Comandos útiles](#comandos-utiles)

## Instalación
1. Asegúrate de tener **Node.js 24.x** y **Angular CLI 20** instalados.
2. Clona este repositorio y ejecuta:
   ```bash
   npm install
   ```
3. Es necesario que el backend de ConectaDuoc esté activo en `http://localhost:9090` para que las peticiones funcionen.

## Ejecución
Levanta la aplicación en modo desarrollo con:
```bash
ng serve
```
El sitio estará disponible en [http://localhost:4200](http://localhost:4200). Ante cualquier problema de dependencias, ejecuta nuevamente `npm install`.

## Estructura del proyecto
- **src/app/**: código principal de la aplicación
  - **components/**: componentes visuales y vistas
  - **core/**: servicios y guards reutilizables
  - **models/**: interfaces TypeScript que describen las entidades
  - **shared/**: componentes compartidos
- **documentation/**: documentación generada con Compodoc
- **manual.txt**: pasos breves para desarrollar

## Módulos y componentes
A continuación se detallan los módulos y componentes más relevantes:

### Componentes generales
- **AppComponent**: componente raíz que gestiona la visibilidad del *navbar* y *footer* según la ruta actual.
- **NavbarComponent**: barra de navegación superior con el nombre de usuario y opción de cierre de sesión.
- **FooterComponent**: pie de página con el año actual.
- **BreadcrumbComponent**: genera la ruta de navegación según la URL activa.
- **NotificacionBannerComponent**: muestra notificaciones globales rotativas.
- **ModalConfirmacionComponent** (shared): modal reutilizable para confirmar acciones.

### Autenticación y perfil
- **LoginComponent**: integra MSAL para iniciar sesión con Azure AD y valida la existencia del usuario.
- **RegisterComponent**: formulario de registro inicial donde el usuario selecciona su sede.
- **ReglasDeLaComunidadComponent**: muestra y requiere aceptar las políticas antes de usar la plataforma.
- **PerfilComponent**: permite al usuario ver y filtrar sus publicaciones, editar su sede y consultar estadísticas personales.

### Publicaciones y categorías
- **DashboardComponent**: página principal que lista las categorías activas y el banner de notificaciones.
- **CategoriasComponent**: muestra las publicaciones de una categoría, permite crear nuevas, filtrarlas, reportarlas y calificarlas.
- **DetalleComponent**: vista de detalle de una publicación con sus comentarios, opción de calificar y reportar.

### Administración
- **ConfiguracionComponent**: panel base para la administración de la plataforma.
  - **UsuariosComponent**: listado y edición de usuarios registrados.
  - **CategoriasAdminComponent**: gestión completa de categorías (crear, editar y eliminar).
  - **NotificacionesComponent**: creación y eliminación de notificaciones globales.
- **PublicacionesReportadasComponent**: módulo para revisar y resolver reportes de publicaciones o comentarios.
- **ForbiddenComponent**: se muestra si el usuario intenta acceder a una ruta no autorizada.

## Servicios y utilidades
Todos los servicios se encuentran en `src/app/core/services` y centralizan la comunicación con el backend:
- **UserService**: registra usuarios, consulta datos, mantiene nombre/rol en *localStorage* y expone un observable con el nombre.
- **PostService**: CRUD de publicaciones y registro de visualizaciones.
- **CommentService**: operaciones sobre comentarios de publicaciones.
- **PostCategoryService**: gestión de categorías de publicaciones (también usado desde el panel de configuración).
- **ReportService**: creación y actualización de reportes de publicaciones y comentarios.
- **ScoreService**: guarda y consulta puntuaciones (scores) de las publicaciones.
- **NotificacionService**: CRUD de notificaciones globales visibles en el banner.
- **RoleService**: utilitario simple para verificar roles almacenados.

### Guards
- **AuthGuard**: asegura que el usuario esté autenticado con Azure AD.
- **RoleGuard**: restringe rutas según el rol almacenado en *localStorage*.

### Modelos
Entre las interfaces principales se incluyen `User`, `Post`, `Comment`, `PostCategory`, `NotificacionGlobal`, `Report` y `Score`, ubicadas en `src/app/models`.

## Rutas principales
El archivo `app.routes.ts` define la navegación de la aplicación. Algunas rutas importantes son:
- `/` – pantalla de inicio de sesión.
- `/registro` – formulario de registro tras el primer login.
- `/reglas-de-la-comunidad` – aceptación de políticas.
- `/dashboard` – panel principal con las categorías.
- `/dashboard/perfil` – perfil del usuario.
- `/dashboard/reportes` – revisión de publicaciones y comentarios reportados (solo administradores).
- `/dashboard/panel-de-configuracion` y subrutas (`usuarios`, `categorias`, `notificaciones`).
- `/categoria/:slug` – publicaciones de una categoría.
- `/categoria/:slug/:id` – detalle de una publicación.

## Comandos útiles
- `npm start` o `ng serve` – inicia el servidor de desarrollo.
- `npm run build` – compila la aplicación en modo producción en la carpeta `dist/`.
- `npm test` – ejecuta las pruebas unitarias con Karma.
- `npm run lint` – ejecuta ESLint.
- `npm run compodoc` – genera la documentación en `documentation/` y la abre en un servidor local.

---
Con esta información cualquier desarrollador puede instalar, ejecutar y comprender la estructura general de ConectaDuoc.
