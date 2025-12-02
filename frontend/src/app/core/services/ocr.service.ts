// src/app/core/services/ocr.service.ts
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  OcrJob,
  OcrOptions,
  OcrResult,
  ProcessBase64Request,
  ProcessUrlRequest,
  UploadedFile,
} from '../models/ocr.models';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Upload file(s) to the server
   */
  uploadFile(file: File): Observable<{ progress: number; file?: UploadedFile }> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.apiUrl}/ocr/upload`, formData, {
      reportProgress: true,
    });

    return this.http.request<ApiResponse<UploadedFile>>(req).pipe(
      map((event) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
            return { progress };
          case HttpEventType.Response:
            return {
              progress: 100,
              file: event.body?.data,
            };
          default:
            return { progress: 0 };
        }
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Process uploaded file by ID
   */
  processFile(fileId: string, prompt?: string, options?: OcrOptions): Observable<OcrJob> {
    return this.http
      .post<ApiResponse<OcrJob>>(`${this.apiUrl}/ocr/process`, {
        fileId,
        prompt,
        options,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to process file');
          }
          return response.data;
        }),
        catchError((error) => throwError(() => error))
      );
  }

  /**
   * Process file from URL
   */
  processUrl(request: ProcessUrlRequest): Observable<OcrJob> {
    return this.http.post<ApiResponse<OcrJob>>(`${this.apiUrl}/ocr/process-url`, request).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to process URL');
        }
        return response.data;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Process file from base64
   */
  processBase64(request: ProcessBase64Request): Observable<OcrJob> {
    return this.http.post<ApiResponse<OcrJob>>(`${this.apiUrl}/ocr/process-base64`, request).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to process base64');
        }
        return response.data;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): Observable<OcrJob> {
    return this.http.get<ApiResponse<OcrJob>>(`${this.apiUrl}/ocr/status/${jobId}`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to get job status');
        }
        return response.data;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Get job result
   */
  getJobResult(jobId: string): Observable<OcrResult> {
    return this.http.get<ApiResponse<OcrResult>>(`${this.apiUrl}/ocr/result/${jobId}`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to get result');
        }
        return response.data;
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Delete uploaded file
   */
  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/ocr/file/${fileId}`).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete file');
        }
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Health check
   */
  healthCheck(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`);
  }
}