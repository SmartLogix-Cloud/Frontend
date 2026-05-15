<<<<<<< HEAD
# SmartLogix

Monorepo del sistema SmartLogix — plataforma logística para PYMEs eCommerce.

Arquitectura de microservicios con Traefik como Ingress, Krakend como API Gateway, BFF en Node.js y microservicios Spring Boot con DB-per-Service.

## Estructura

```
smartlogixs/
├── docker-compose.yml             # Orquesta el stack completo
├── .env.example                   # Variables (copiar a .env)
├── infra/
│   └── traefik/                   # Config Ingress Controller
│       ├── traefik.yml
│       └── dynamic/middlewares.yml
├── docs/                          # Diagramas, informes
├── frontend/                      # React 19 + Vite + Nginx
└── backend/
    ├── bff/                       # Node.js 20 (Express)
    └── microservicios/
        ├── apigateway/            # Krakend v2.10.2
        ├── ms-envio/envio/        # Spring Boot 4 / Java 25
        ├── ms-inventario/         # Spring Boot 4 / Java 25
        └── ms-pedido/             # Spring Boot 4 / Java 25
```

## Topología (según diagrama de contenedores)

```
Internet
   │
   ▼
Traefik v3.5 (Ingress)         red: web (publica)
   ├── app.smartlogix.localhost      → Frontend
   ├── api.smartlogix.localhost      → API Gateway (Krakend)
   ├── bff.smartlogix.localhost      → BFF (debug directo)
   └── traefik.smartlogix.localhost  → Dashboard

API Gateway → BFF → ms-{inventario,pedido,envio}
                          │
                          ▼
                    db-{...}                red: internal (privada)
```

- **`web`**: red pública donde Traefik enruta tráfico externo
- **`internal`** (`internal: true`): red aislada del exterior; las DBs y MS no son alcanzables desde Internet

## Levantar el stack

### 1. Pre-requisitos

- Docker Desktop o Docker Engine + Compose v2
- Editar el `hosts` de tu sistema operativo:

**Windows** (`C:\Windows\System32\drivers\etc\hosts`, abrir como administrador):
```
127.0.0.1 app.smartlogix.localhost
127.0.0.1 api.smartlogix.localhost
127.0.0.1 bff.smartlogix.localhost
127.0.0.1 traefik.smartlogix.localhost
```

> En Linux, `*.localhost` resuelve automáticamente, no hace falta tocar `/etc/hosts`.

### 2. Variables

```bash
cp .env.example .env
# editar passwords si lo necesitas
```

### 3. Build + up

```bash
docker compose build
docker compose up -d
```

Verificar:
```bash
docker compose ps
```

### 4. Smoke tests

| URL | Qué deberías ver |
|---|---|
| http://app.smartlogix.localhost | Frontend con health del gateway |
| http://api.smartlogix.localhost/health | `{"status":"ok","service":"bff"}` |
| http://bff.smartlogix.localhost/health | `{"status":"ok","service":"bff"}` |
| http://traefik.smartlogix.localhost | Dashboard Traefik |

## Componentes

### Traefik (Ingress Controller v3.5)

- Provider Docker: descubre servicios por **labels**
- Provider File: middlewares en `infra/traefik/dynamic/`
- Entrypoints: `web` (80), `websecure` (443, preparado), `traefik` (8080, dashboard)
- HTTPS: la sección Let's Encrypt está preparada y comentada en `traefik.yml`

### Krakend (API Gateway v2.10.2)

- Configuración declarativa en `backend/microservicios/apigateway/krakend.json`
- Routing: `/api/inventario/*`, `/api/pedidos/*`, `/api/envios/*` → BFF
- JWT validator preparado para activarse cuando exista emisor

### BFF (Node.js 20 + Express)

- Stub funcional con proxy a los 3 microservicios
- Endpoints: `/health`, `/inventario/*`, `/pedidos/*`, `/envios/*`

### Microservicios (Spring Boot 4 + Java 25)

- **Importante**: el código actual usa Spring Boot **4.0.6** y Java **25** (no Spring Boot 3 / Java 21 como dice el diagrama). Los Dockerfiles están alineados al código real.
- Cada MS lee:
  - `SERVER_PORT` (default 8080)
  - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
- Las env vars de DB están seteadas en compose. **Para usarlas hay que agregar `spring-boot-starter-data-jpa` y `org.postgresql:postgresql` al `build.gradle`** y crear entidades/repositorios.

### PostgreSQL 16 (DB-per-Service)

- 3 instancias separadas (`db-inventario`, `db-pedido`, `db-envio`)
- Aisladas en red `internal`, sin puertos expuestos al host
- Volúmenes persistentes: `pg-{inventario,pedido,envio}-data`
- Healthcheck con `pg_isready`

## Comandos útiles

```bash
# Logs en vivo
docker compose logs -f
docker compose logs -f bff

# Rebuild de un servicio específico
docker compose up -d --build bff

# Conectar a una DB
docker compose exec db-inventario psql -U inventario -d inventario

# Bajar todo (mantiene volúmenes)
docker compose down

# Bajar todo y borrar volúmenes (⚠ pierde data)
docker compose down -v

# Validar sintaxis del compose
docker compose config
```

## Próximos pasos

1. **Activar JPA**: agregar deps en cada `build.gradle` para que los MS hablen con su DB
2. **Activar JWT**: configurar el JWT validator de Krakend con secret/issuer real
3. **Activar HTTPS**: descomentar la sección `certificatesResolvers` en `traefik.yml`
4. **Circuit Breaker**: agregar Resilience4j al ms-pedido para proteger las llamadas a ms-inventario
5. **Healthchecks de MS**: agregar `spring-boot-starter-actuator` y descomentar HEALTHCHECK en los Dockerfiles
=======
# SmartLogix Frontend

Aplicación frontend del sistema SmartLogix.

## Estructura

Repositorio: [smartLogixfs/Front](https://github.com/smartLogixfs/Front)

Forma parte del ecosistema SmartLogix:
- [smartlogixs](https://github.com/smartLogixfs/smartlogixs) — repo paraguas
- [Docs](https://github.com/smartLogixfs/Docs) — documentación
- [BFF](https://github.com/smartLogixfs/BFF) — Backend For Frontend
- [MS](https://github.com/smartLogixfs/MS) — microservicios

## Setup

_Pendiente — agregar instrucciones de instalación y ejecución._
>>>>>>> abb64e1 (Frontend setup V.3)
