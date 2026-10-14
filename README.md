# Parleo Admin

Panel de administración en Next.js + shadcn/ui. Por ahora se accede con una contraseña compartida (sin cuentas) y muestra los usuarios y su progreso, la estructura de journeys, macros y noun packs, y permite corregir pronunciaciones y escuchar audios. Contexto de producto en [`docs/`](../docs/README.md).

## Arranque

1. Copia `.env.example` a `.env.local` y rellena:
   - `ADMIN_PASSWORD`: contraseña para entrar al panel.
   - `ADMIN_API_KEY`: el mismo valor que `ADMIN_API_KEY` en `api/.env`.
2. Arranca la API (`cd api && ./run.sh`).
3. `npm install && npm run dev -- --port 3001` y abre http://localhost:3001.

## Despliegue en Vercel

Next.js sin configuración. En el proyecto de Vercel añade `ADMIN_PASSWORD`, `ADMIN_API_KEY` (igual que en la API)
y `API_URL` (la URL de la API desplegada).

## Pantallas

- **Usuarios** (`/`): lista con el progreso de cada usuario.
- **Ficha de usuario** (`/users/[id]`): memoria ahora (Σ R, consolidadas, vencidas, frágiles, nuevas de hoy, siguiente gym loop), journey con macros completadas, palabras con su estado FSRS (nueva, escuchada, aprendiendo, consolidada, vencida, imposible; S, R, próximo repaso, fallos), sesiones de gym y de audiocards y registro de repasos.
- **Journeys** (`/journeys`, `/journeys/[id]`): cada journey como recorrido visual paso a paso, con las palabras de cada macro y sus noun packs por idioma, pasos vacíos y palabras sin audio.
- **Macros** (`/macros`, `/macros/[id]`): palabras de cada macro por idioma y sus noun packs.
- **Noun packs** (`/noun-packs`): todos los packs agrupados por objetivo y macro.
- **Palabras** (`/words`): buscar una palabra por su forma, su traducción o su fonética.

En todas las tablas de palabras se puede **editar la pronunciación** (la API la valida con la convención fonética del idioma) y **escuchar los audios** PT/ES generados.

## Cómo funciona

- `src/proxy.ts` redirige a `/login` si no hay cookie de sesión válida (un hash de la contraseña).
- Los datos se piden en el servidor a los endpoints `/api/v1/admin/*` con la cabecera `X-Admin-Key`, así que la clave nunca llega al navegador.
