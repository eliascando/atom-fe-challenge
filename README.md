# Mis Tareas — Angular 17

## Comentarios de desarrollo

Para este challenge armé una SPA con Angular 17 y Angular Material para resolver dos flujos: autenticación y gestión de tareas.

## Stack usado

- Angular 17 standalone
- Angular Material
- Reactive Forms
- RxJS
- Karma + Jasmine

## Decisiones de diseño

- Separé la app en `core`, `modules` y `shared` para no mezclar configuración global, casos de uso y componentes reutilizables.
- Dividí la funcionalidad en dos módulos principales: `auth` y `tasks`.
- Usé `facades` en la capa `application` para que las páginas no hablen directo con HTTP.
- Dejé el JWT en `localStorage` porque el backend ya devuelve token y el challenge no pide refresh token.
- El `authInterceptor` agrega el bearer token en cada request autenticado.
- Si la API responde `401` o `UNAUTHORIZED`, se limpia la sesión y se redirige otra vez a `/auth/login`.
- Protegí `/tasks` con guard y dejé `/auth` solo para usuarios sin sesión activa.

## Estructura

```text
src/app
├── core
├── modules
│   ├── auth
│   └── tasks
└── shared
```

## Backend esperado

La app está configurada en `/Users/sistemas/Documents/personal/atom/atom-fe-challenge/src/app/app.config.ts` y hoy apunta a:

```text
http://localhost:7071/api/v1
```

Endpoints usados:

- `GET /users/exists`
- `POST /auth/login`
- `POST /users`
- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

## Cómo levantarlo

### Frontend

```bash
npm install
npm start
```

### Calidad

```bash
npm run lint
npm test -- --watch=false --browsers=ChromeHeadless
```
