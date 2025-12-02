// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  maxFileSize: 52428800, // 50MB
  allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
  allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
};