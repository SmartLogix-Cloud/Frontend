<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ccaab7bb-7fb7-4fe5-b83c-53f9ad6356b2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run Frontend + BFF for local integration

These steps start the BFF (which proxies to microservices) and the frontend development server.

Notes:
- The frontend reads `VITE_API_BASE` from `frontend/.env.local`. By default it's set to `http://localhost:3001`.
- The BFF's default port is `3000`. To avoid port conflicts we recommend starting the BFF on `3001`.
- If the microservices (e.g., `ms-envio`) are not running, some API calls (listing envíos) will fail — you'll still be able to test the UI and error fallbacks.

PowerShell commands (run from the repository root):

1) Start the BFF on port 3001

```powershell
cd backend\bff
npm install
# Start BFF on port 3001
$env:PORT = "3001"
# Optionally point BFF to running microservices:
$env:MS_ENVIO_URL = "http://localhost:8080"  # if ms-envio runs locally
npm run dev
```

2) Start the frontend (keeps default port 3000)

```powershell
cd frontend
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

Troubleshooting:
- If the BFF can't reach the microservices, inspect its console errors. You can temporarily mock ms-envio with a simple HTTP server or run Docker compose for the whole stack.
- If ports conflict, change `VITE_API_BASE` or set a different `PORT` for the BFF as shown above.

If you want, puedo also add a simple mock endpoint in the BFF that returns sample envíos so you can test the frontend without starting the full microservices — ¿quieres que lo haga?
