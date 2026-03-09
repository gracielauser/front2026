// src/environments/environment.prod.ts
export const environment = {
  production: true,
  // apiUrl: 'https://backend2026-jqwt.onrender.com'  // tu backend real
  apiUrl: process.env['apiURL'] || 'http://localhost:8080' // Usa la variable de entorno o localhost como fallback
};
