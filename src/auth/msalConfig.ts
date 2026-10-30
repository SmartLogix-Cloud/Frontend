import { PublicClientApplication, Configuration } from '@azure/msal-browser';

/**
 * Configuración de MSAL (Microsoft Entra ID) para el frontend de SmartLogix.
 *
 * El flujo es OAuth 2.0 / OpenID Connect contra Entra: el usuario inicia sesión,
 * MSAL obtiene un Access Token (JWT) para el scope de la API protegida y el
 * apiClient lo adjunta como `Authorization: Bearer` en cada llamada al BFF.
 *
 * Los valores vienen de variables Vite (VITE_AZURE_*) y, si no están, usan los
 * del tenant SmartLogix (PAONARR.onmicrosoft.com) como fallback.
 */
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID ?? 'fd3a5752-a5c4-4102-a150-ab53dc03d8e7';
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID ?? 'e4c4f2ee-ede4-48bb-9d0b-7e6d9e1867eb';
const apiScope = import.meta.env.VITE_AZURE_API_SCOPE ?? `api://${clientId}/access_as_user`;
// Por defecto el origen actual (sirve para http://localhost:3000 y la URL de Azure).
const redirectUri = import.meta.env.VITE_REDIRECT_URI ?? window.location.origin;

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

/** Scopes para el LOGIN (identidad + acceso a la API). */
export const loginRequest = {
  scopes: ['openid', 'profile', apiScope],
};

/** Scopes para adquirir el Access Token de la API protegida (BFF/API Gateway). */
export const apiTokenRequest = {
  scopes: [apiScope],
};

/** Instancia única de MSAL, compartida por el MsalProvider y el apiClient. */
export const msalInstance = new PublicClientApplication(msalConfig);
