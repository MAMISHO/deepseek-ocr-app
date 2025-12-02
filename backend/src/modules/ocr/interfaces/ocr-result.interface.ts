export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface OcrResult {
  text: string;
  pages?: {
    pageNumber: number;
    text: string;
    confidence?: number;
  }[];
  metadata?: {
    totalPages?: number;
    processedAt?: Date;
    model?: string;
    sourceUrl?: string;
    sourcePath?: string;
    filename?: string;
  };
}

export interface OcrJob {
  id: string;
  fileId?: string;
  status: JobStatus;
  progress?: {
    currentPage: number;
    totalPages: number;
    percentage: number;
  };
  prompt?: string;
  options?: {
    language?: string;
    outputFormat?: 'text' | 'json' | 'markdown';
    includeConfidence?: boolean;
    pageRange?: string;
  };
  result?: OcrResult;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface FileInfo {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
}