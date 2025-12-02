export default () => ({
  app: {
    name: process.env.APP_NAME || 'deepseek-ocr',
    env: process.env.APP_ENV || 'development',
    port: parseInt(process.env.APP_PORT || '3000', 10),
    host: process.env.APP_HOST || '0.0.0.0',
    corsOrigins: process.env.APP_CORS_ORIGINS || 'http://localhost:4200',
  },
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'deepseek-ocr',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '300000', 10),
    maxRetries: parseInt(process.env.OLLAMA_MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.OLLAMA_RETRY_DELAY || '1000', 10),
  },
  ocr: {
    defaultLanguage: process.env.OCR_DEFAULT_LANGUAGE || 'auto',
    defaultOutputFormat: process.env.OCR_DEFAULT_OUTPUT_FORMAT || 'text',
    maxPages: parseInt(process.env.OCR_MAX_PAGES || '100', 10),
    defaultPrompt: process.env.OCR_DEFAULT_PROMPT || 'Extract all text from this image.',
  },
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || '52428800', 10),
    allowedMimeTypes: (process.env.STORAGE_ALLOWED_MIMETYPES || 'application/pdf,image/png,image/jpeg').split(','),
  },
  security: {
    apiKeyEnabled: process.env.API_KEY_ENABLED === 'true',
    apiKeyHeader: process.env.API_KEY_HEADER || 'x-api-key',
    apiKeys: (process.env.API_KEYS || '').split(',').filter(Boolean),
  },
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'pretty',
  },
});