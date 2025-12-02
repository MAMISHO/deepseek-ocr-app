// src/app/core/models/ocr.models.ts
export interface OcrOptions {
  language?: string;
  outputFormat?: 'text' | 'json' | 'markdown';
  includeConfidence?: boolean;
  pageRange?: string;
}

export interface ProcessUrlRequest {
  url: string;
  prompt?: string;
  options?: OcrOptions;
}

export interface ProcessBase64Request {
  data: string;
  filename: string;
  mimeType: string;
  prompt?: string;
  options?: OcrOptions;
}

export interface ProcessPathRequest {
  path: string;
  prompt?: string;
  options?: OcrOptions;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

export interface OcrJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: OcrResult;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface OcrResult {
  text: string;
  confidence?: number;
  pages?: OcrPageResult[];
  metadata?: Record<string, unknown>;
  processingTime?: number;
}

export interface OcrPageResult {
  pageNumber: number;
  text: string;
  confidence?: number;
}

export interface FileWithPreview {
  file: File;
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
  uploadedFile?: UploadedFile;
  result?: OcrResult;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}