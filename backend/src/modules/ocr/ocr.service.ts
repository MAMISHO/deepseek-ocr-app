import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OllamaService } from '../ollama/ollama.service';
import { StorageService } from '../storage/storage.service';
import { ProcessBase64Dto } from './dto/process-base64.dto';
import { ProcessFileDto } from './dto/process-file.dto';
import { ProcessPathDto } from './dto/process-path.dto';
import { ProcessUrlDto } from './dto/process-url.dto';
import { FileInfo, JobStatus, OcrJob } from './interfaces/ocr-result.interface';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private jobs: Map<string, OcrJob> = new Map();
  private files: Map<string, FileInfo> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly ollamaService: OllamaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<FileInfo> {
    const fileId = uuidv4();
    const savedFile = await this.storageService.saveFile(file, fileId);
    
    const fileInfo: FileInfo = {
      id: fileId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: savedFile.path,
      uploadedAt: new Date(),
    };

    this.files.set(fileId, fileInfo);
    return fileInfo;
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<{ files: FileInfo[] }> {
    const uploadedFiles: FileInfo[] = [];

    for (const file of files) {
      const fileInfo = await this.uploadFile(file);
      uploadedFiles.push(fileInfo);
    }

    return { files: uploadedFiles };
  }

  async processFile(dto: ProcessFileDto): Promise<OcrJob> {
    const fileInfo = this.files.get(dto.fileId);
    if (!fileInfo) {
      throw new NotFoundException(`File with ID ${dto.fileId} not found`);
    }

    const jobId = uuidv4();
    const job: OcrJob = {
      id: jobId,
      fileId: dto.fileId,
      status: 'pending',
      createdAt: new Date(),
      prompt: dto.prompt || this.configService.get<string>('ocr.defaultPrompt'),
      options: dto.options,
    };

    this.jobs.set(jobId, job);

    // Process asynchronously
    this.processFileAsync(job, fileInfo);

    return job;
  }

  private async processFileAsync(job: OcrJob, fileInfo: FileInfo): Promise<void> {
    try {
      job.status = 'processing';
      job.startedAt = new Date();
      this.jobs.set(job.id, job);

      let images: string[];

      if (fileInfo.mimeType === 'application/pdf') {
        // Convert PDF to images
        images = await this.storageService.convertPdfToImages(fileInfo.path);
      } else {
        // Read image as base64
        const imageBuffer = await fs.readFile(fileInfo.path);
        images = [imageBuffer.toString('base64')];
      }

      const results: string[] = [];
      const totalPages = images.length;

      for (let i = 0; i < images.length; i++) {
        job.progress = {
          currentPage: i + 1,
          totalPages,
          percentage: Math.round(((i + 1) / totalPages) * 100),
        };
        this.jobs.set(job.id, job);

        const result = await this.ollamaService.processImage(images[i], job.prompt || '<image>\nExtract the text in the image.');
        results.push(result.text);
      }

      job.status = 'completed';
      job.completedAt = new Date();
      job.result = {
        text: results.join('\n\n--- Page Break ---\n\n'),
        pages: results.map((text, index) => ({
          pageNumber: index + 1,
          text,
        })),
        metadata: {
          totalPages,
          processedAt: new Date(),
          model: this.configService.get<string>('ollama.model'),
        },
      };
      this.jobs.set(job.id, job);
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}: ${(error as Error).message}`);
      job.status = 'failed';
      job.error = (error as Error).message;
      job.completedAt = new Date();
      this.jobs.set(job.id, job);
    }
  }

  async processUrl(dto: ProcessUrlDto): Promise<OcrJob> {
    const jobId = uuidv4();
    const job: OcrJob = {
      id: jobId,
      status: 'pending',
      createdAt: new Date(),
      prompt: dto.prompt || this.configService.get<string>('ocr.defaultPrompt'),
      options: dto.options,
    };

    this.jobs.set(jobId, job);

    // Process asynchronously
    this.processUrlAsync(job, dto.url);

    return job;
  }

  private async processUrlAsync(job: OcrJob, url: string): Promise<void> {
    try {
      job.status = 'processing';
      job.startedAt = new Date();
      this.jobs.set(job.id, job);

      // Download file from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new BadRequestException(`Failed to fetch URL: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/png';

      let images: string[];

      if (contentType.includes('pdf')) {
        const tempPath = await this.storageService.saveTempFile(buffer, 'temp.pdf');
        images = await this.storageService.convertPdfToImages(tempPath);
        await fs.unlink(tempPath);
      } else {
        images = [buffer.toString('base64')];
      }

      const results: string[] = [];
      for (const image of images) {
        const result = await this.ollamaService.processImage(image, job.prompt || '<image>\nExtract the text in the image.');
        results.push(result.text);
      }

      job.status = 'completed';
      job.completedAt = new Date();
      job.result = {
        text: results.join('\n\n--- Page Break ---\n\n'),
        pages: results.map((text, index) => ({
          pageNumber: index + 1,
          text,
        })),
        metadata: {
          totalPages: images.length,
          processedAt: new Date(),
          model: this.configService.get<string>('ollama.model'),
          sourceUrl: url,
        },
      };
      this.jobs.set(job.id, job);
    } catch (error) {
      this.logger.error(`Error processing URL job ${job.id}: ${(error as Error).message}`);
      job.status = 'failed';
      job.error = (error as Error).message;
      job.completedAt = new Date();
      this.jobs.set(job.id, job);
    }
  }

  async processBase64(dto: ProcessBase64Dto): Promise<OcrJob> {
    const jobId = uuidv4();
    const job: OcrJob = {
      id: jobId,
      status: 'pending',
      createdAt: new Date(),
      prompt: dto.prompt || this.configService.get<string>('ocr.defaultPrompt'),
      options: dto.options,
    };

    this.jobs.set(jobId, job);

    // Process asynchronously
    this.processBase64Async(job, dto);

    return job;
  }

  private async processBase64Async(job: OcrJob, dto: ProcessBase64Dto): Promise<void> {
    try {
      job.status = 'processing';
      job.startedAt = new Date();
      this.jobs.set(job.id, job);

      let images: string[];

      if (dto.mimeType === 'application/pdf') {
        const buffer = Buffer.from(dto.data, 'base64');
        const tempPath = await this.storageService.saveTempFile(buffer, dto.filename);
        images = await this.storageService.convertPdfToImages(tempPath);
        await fs.unlink(tempPath);
      } else {
        images = [dto.data];
      }

      const results: string[] = [];
      for (const image of images) {
        const result = await this.ollamaService.processImage(image, job.prompt || '<image>\nExtract the text in the image.');
        results.push(result.text);
      }

      job.status = 'completed';
      job.completedAt = new Date();
      job.result = {
        text: results.join('\n\n--- Page Break ---\n\n'),
        pages: results.map((text, index) => ({
          pageNumber: index + 1,
          text,
        })),
        metadata: {
          totalPages: images.length,
          processedAt: new Date(),
          model: this.configService.get<string>('ollama.model'),
          filename: dto.filename,
        },
      };
      this.jobs.set(job.id, job);
    } catch (error) {
      this.logger.error(`Error processing base64 job ${job.id}: ${(error as Error).message}`);
      job.status = 'failed';
      job.error = (error as Error).message;
      job.completedAt = new Date();
      this.jobs.set(job.id, job);
    }
  }

  async processPath(dto: ProcessPathDto): Promise<OcrJob> {
    // Verify file exists
    try {
      await fs.access(dto.path);
    } catch {
      throw new NotFoundException(`File not found at path: ${dto.path}`);
    }

    const jobId = uuidv4();
    const job: OcrJob = {
      id: jobId,
      status: 'pending',
      createdAt: new Date(),
      prompt: dto.prompt || this.configService.get<string>('ocr.defaultPrompt'),
      options: dto.options,
    };

    this.jobs.set(jobId, job);

    // Process asynchronously
    this.processPathAsync(job, dto.path);

    return job;
  }

  private async processPathAsync(job: OcrJob, filePath: string): Promise<void> {
    try {
      job.status = 'processing';
      job.startedAt = new Date();
      this.jobs.set(job.id, job);

      const ext = path.extname(filePath).toLowerCase();
      let images: string[];

      if (ext === '.pdf') {
        images = await this.storageService.convertPdfToImages(filePath);
      } else {
        const buffer = await fs.readFile(filePath);
        images = [buffer.toString('base64')];
      }

      const results: string[] = [];
      for (const image of images) {
        const result = await this.ollamaService.processImage(image, job.prompt || '<image>\nExtract the text in the image.');
        results.push(result.text);
      }

      job.status = 'completed';
      job.completedAt = new Date();
      job.result = {
        text: results.join('\n\n--- Page Break ---\n\n'),
        pages: results.map((text, index) => ({
          pageNumber: index + 1,
          text,
        })),
        metadata: {
          totalPages: images.length,
          processedAt: new Date(),
          model: this.configService.get<string>('ollama.model'),
          sourcePath: filePath,
        },
      };
      this.jobs.set(job.id, job);
    } catch (error) {
      this.logger.error(`Error processing path job ${job.id}: ${(error as Error).message}`);
      job.status = 'failed';
      job.error = (error as Error).message;
      job.completedAt = new Date();
      this.jobs.set(job.id, job);
    }
  }

  async getStatus(jobId: string): Promise<{ status: JobStatus; progress?: any }> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return {
      status: job.status,
      progress: job.progress,
    };
  }

  async getResult(jobId: string): Promise<OcrJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return job;
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    const fileInfo = this.files.get(fileId);
    if (!fileInfo) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    await this.storageService.deleteFile(fileInfo.path);
    this.files.delete(fileId);

    return { message: `File ${fileId} deleted successfully` };
  }

  getUploadedFiles(): FileInfo[] {
    return Array.from(this.files.values());
  }
}