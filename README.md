# SmartLogix Frontend

Aplicación web del sistema SmartLogix. SPA en React 19 servida por Nginx en producción y por Vite en desarrollo.

**Stack**: React 19 · Vite 5 · Nginx (sirve el build en producción).

## Responsabilidad

Capa de **presentación**. Consume al BFF (`http://bff.smartlogix.localhost`) y al API Gateway (`http://api.smartlogix.localhost`).
No habla directamente con los microservicios.

## Cómo ejecutar

### Vía Docker (recomendado para integración)

Desde la raíz del monorepo:

```bash
docker compose up -d frontend
```

Levanta Nginx sirviendo el build de Vite en el puerto interno 80, expuesto vía Traefik en
`http://app.smartlogix.localhost`.

### Local con Vite (recomendado para desarrollo)

```bash
cd frontend
npm install
npm run dev          # dev server con HMR en http://localhost:5173
```

Vite usa el `vite.config.js` para proxear las llamadas a la API hacia el BFF. Si necesitas apuntar a otra URL, edita ese archivo.

### Build de producción

```bash
npm run build        # genera dist/
npm run preview      # sirve dist/ localmente para inspección
```

El `Dockerfile` hace `npm run build` y copia `dist/` al contenedor Nginx.

## Estructura

```
frontend/
├── index.html              # entry HTML servido por Vite/Nginx
├── package.json            # deps: react 19, react-dom 19, vite 5
├── vite.config.js          # config Vite (puerto, proxy)
├── nginx.conf              # config del Nginx que sirve dist/ en Docker
├── Dockerfile              # multi-stage build (vite build → nginx alpine)
└── src/
    ├── main.jsx            # entry: monta <App> en #root
    └── App.jsx             # componente raíz
```

## Empaquetado como NPM (lib mode)

Para empaquetar componentes reutilizables como librería NPM, agregar al `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'SmartLogixUI',
      fileName: (format) => `smartlogix-ui.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } }
    }
  }
})
```

Y agregar al `package.json`:

```json
{
  "main": "dist/smartlogix-ui.cjs.js",
  "module": "dist/smartlogix-ui.es.js",
  "files": ["dist"],
  "peerDependencies": { "react": "^19.0.0", "react-dom": "^19.0.0" }
}
```

Luego `npm pack` genera el `.tgz` listo para publicar a un registry.

## Hosts a tener configurados (Windows)

`C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 app.smartlogix.localhost
127.0.0.1 bff.smartlogix.localhost
127.0.0.1 api.smartlogix.localhost
```

En Chrome/Firefox/Edge esos hosts resuelven automáticamente a 127.0.0.1 sin necesidad de editar `hosts`.

## Patrones aplicados

- **SPA** servida estáticamente (Nginx) en producción, **HMR** en desarrollo
- **BFF-first**: el frontend solo conoce el BFF, no los MS
- Build **multi-stage** en Docker para imagen final mínima
