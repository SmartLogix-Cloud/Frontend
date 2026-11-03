# SmartLogix — Frontend

Panel web (SPA) de la plataforma logística **SmartLogix**. Es la capa de presentación del
caso de la asignatura **DSY1107 – Desarrollo Cloud Native I** (EP1 + EP2).

Inicia sesión contra **Microsoft Entra ID** (OAuth 2.0 / OpenID Connect) usando **MSAL**,
obtiene un **Access Token (JWT)** y consume el backend **a través del AWS API Gateway → BFF**,
adjuntando el token como `Authorization: Bearer` en cada llamada. El acceso a cada vista y
operación se habilita según el **perfil** del usuario (`Admin` / `Operador` / `Cliente`)
que viaja en el claim `roles` del token.

> Este repositorio contiene **solo el frontend**. El backend (microservicios, BFF,
> `ms-broker-admin`, clúster RabbitMQ e infraestructura) vive en el repositorio
> [`SmartLogix-Cloud/Backend`](https://github.com/SmartLogix-Cloud/Backend).

---

## Stack

| Área | Tecnología |
|------|------------|
| UI | React 19 + TypeScript |
| Build / dev server | Vite 6 |
| Estilos | Tailwind CSS 4 |
| Autenticación | MSAL (`@azure/msal-browser`, `@azure/msal-react`) contra Entra ID |
| Observabilidad | Sentry / GlitchTip (`@sentry/react`) |
| AI Hub (opcional) | Google Gemini (`@google/genai`) |
| Íconos / animación | `lucide-react`, `motion` |
| Empaquetado / deploy | Dockerfile + nginx, manifiestos Kubernetes (`k8s/`), Azure Static Website |

---

## Requisitos previos

- **Node.js 20+** y npm.
- Una **App Registration** en Microsoft Entra ID con:
  - Plataforma **SPA** y los *redirect URIs* registrados (ver [Entra ID](#configuración-de-entra-id-spa)).
  - Un scope expuesto en *Expose an API* (`access_as_user`).
  - Los **App Roles** de perfil `Admin` / `Operador` / `Cliente` creados y asignados a los usuarios.
- Backend desplegado y accesible (AWS API Gateway → BFF). Para desarrollo puede apuntarse a `/api`.

---

## Configuración

Las variables se gestionan con Vite. **Solo las que empiezan con `VITE_`** se exponen al
cliente, y se *inlinan en el bundle en tiempo de build*.

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE` | Base del API (gateway/BFF). Si se omite, usa `/api` (proxy). En prod, el *Invoke URL* del AWS API Gateway. | `/api` |
| `VITE_AZURE_TENANT_ID` | Tenant (Directory) ID de Entra. | `fd3a5752-...` |
| `VITE_AZURE_CLIENT_ID` | Application (client) ID de la App Registration. | `e4c4f2ee-...` |
| `VITE_AZURE_API_SCOPE` | Scope de la API protegida (debe existir en *Expose an API*). | `api://<clientId>/access_as_user` |
| `VITE_REDIRECT_URI` | Redirect URI SPA. Si se omite, usa el origen actual. | `http://localhost:3000` |
| `VITE_GEMINI_API_KEY` | API key de Gemini para el AI Hub. Vacía → AI Hub en modo simulado. | *(vacío)* |

> Todos los valores de Entra tienen *fallback* al tenant de SmartLogix en
> `src/auth/msalConfig.ts`, de modo que la app arranca aun sin `.env`, pero se recomienda
> definirlos explícitamente.

---

## Ejecución local

```bash
npm install
npm run dev     # Vite en http://localhost:3000 (host 0.0.0.0)
```

Para una build de producción:

```bash
npm run build   # genera dist/
npm run preview # sirve el build localmente
npm run lint    # chequeo de tipos (tsc --noEmit)
```

---

## Configuración de Entra ID (SPA)

En la App Registration, plataforma **Single-page application**, registra los *redirect URIs*:

- Desarrollo: `http://localhost:3000`
- Producción: `https://smartlogixfrontduoc.z15.web.core.windows.net/`

El login pide los scopes `openid`, `profile` y el scope de la API; el token de API se
adquiere en silencio (`acquireTokenSilent`) y, si Entra exige interacción, se redirige al login.

### Perfiles / roles

El claim `roles` del token trae el **perfil** del usuario. El frontend lo lee desde los
`idTokenClaims` de la cuenta MSAL y lo usa para la UI; la **autorización efectiva** (p. ej.
que solo `Admin` pueda administrar RabbitMQ en `/api/admin/*`) la aplica el **BFF**.

| Perfil | Alcance |
|--------|---------|
| `Cliente` | Lectura de su dominio (pedidos/envíos). |
| `Operador` | Gestión de pedidos, envíos e inventario (lectura y escritura). |
| `Admin` | Todo lo anterior + administración de la topología de RabbitMQ (`/api/admin/*`). |

---

## Estructura

```
src/
  main.tsx              # Punto de entrada; monta MsalProvider + App
  App.tsx               # Orquesta sesión MSAL, carga de datos y navegación por pestañas
  auth/
    msalConfig.ts       # Configuración MSAL (authority, scopes, instancia única)
  client/
    apiClient.ts        # Llamadas al BFF con Bearer token (acquireTokenSilent)
    geminiClient.ts     # Cliente del AI Hub (Gemini)
  components/
    Sidebar.tsx         # Navegación lateral + perfil del usuario
    GlitchTipDemo.tsx   # Disparadores de errores para validar observabilidad
  pages/
    Login.tsx           # Pantalla de inicio de sesión (MSAL)
    DashboardHome.tsx   # Resumen / overview
    WarehouseGrid.tsx   # Inventario (productos y stock)
    ShipmentTable.tsx   # Envíos
    OrdersView.tsx      # Pedidos
    AIHub.tsx           # Optimizador de ruta + chatbot (Gemini)
  data/mockData.ts      # Datos de apoyo (logs iniciales)
  types.ts              # Tipos de dominio y DTOs del BFF
k8s/                    # Manifiestos Kubernetes (deployment, service, kustomization)
Dockerfile, nginx.conf  # Imagen de contenedor para servir el build
```

---

## Flujo de autenticación (resumen)

1. El usuario pulsa **Login**; MSAL redirige a Microsoft Entra ID (OAuth 2.0 / OIDC).
2. Tras autenticarse, MSAL guarda la cuenta y obtiene el **Access Token (JWT)** del scope de la API.
3. `apiClient` adquiere el token en silencio y lo adjunta como `Authorization: Bearer <token>`.
4. La llamada viaja a **API Gateway → BFF**, que **revalidan el JWT** (issuer, audience, firma,
   vigencia) y aplican **autorización por rol**.
5. La respuesta JSON vuelve a la UI, que muestra el resultado según el perfil autenticado.

---

## Despliegue

- **Producción (Azure Static Website):** `npm run build` y publicar `dist/` en el contenedor
  `$web` de la cuenta de almacenamiento. URL actual:
  `https://smartlogixfrontduoc.z15.web.core.windows.net/`.
  Recuerda registrar esa URL como *redirect URI* SPA en Entra y apuntar `VITE_API_BASE` al
  *Invoke URL* del AWS API Gateway antes del build.
- **Contenedor / Kubernetes:** se incluye `Dockerfile` (build + nginx) y manifiestos en `k8s/`.

---

## Proyecto

Parte del encargo **EP2** (RabbitMQ + clúster + Docker Compose en la nube) sobre la base de la
**EP1** (Entra ID + MSAL + API Gateway + BFF + microservicios). El backend y la infraestructura
asociada están en el repositorio hermano **SmartLogix-Cloud/Backend**.
