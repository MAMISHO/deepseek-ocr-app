// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api',
  maxFileSize: 52428800, // 50MB
  allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
  allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
};