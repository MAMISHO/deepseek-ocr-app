import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCanvas } from 'canvas';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('storage.localPath') || './uploads';
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadPath}`);
    }
  }

  async saveFile(file: Express.Multer.File, fileId: string): Promise<{ path: string; filename: string }> {
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const filePath = path.join(this.uploadPath, filename);

    // File is already saved by Multer, just return the path
    if (file.path) {
      return { path: file.path, filename: file.filename };
    }

    // If buffer is provided (memory storage)
    if (file.buffer) {
      await fs.writeFile(filePath, file.buffer);
      return { path: filePath, filename };
    }

    throw new Error('No file data available');
  }

  async saveTempFile(buffer: Buffer, filename: string): Promise<string> {
    const tempDir = path.join(this.uploadPath, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const tempFilename = `${uuidv4()}-${filename}`;
    const tempPath = path.join(tempDir, tempFilename);
    
    await fs.writeFile(tempPath, buffer);
    return tempPath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.debug(`Deleted file: ${filePath}`);
    } catch (error) {
      this.logger.warn(`Failed to delete file ${filePath}: ${(error as Error).message}`);
    }
  }

  async convertPdfToImages(pdfPath: string): Promise<string[]> {
    const images: string[] = [];
    
    try {
      this.logger.log(`Converting PDF to images: ${pdfPath}`);
      
      // Read PDF file
      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfData = new Uint8Array(pdfBuffer);
      
      // Load PDF document
      const pdfDocument = await pdfjsLib.getDocument({
        data: pdfData,
        useSystemFonts: true,
      }).promise;
      
      this.logger.log(`PDF loaded successfully. Total pages: ${pdfDocument.numPages}`);
      
      // Process each page
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        
        // Set scale for good quality (2x for better OCR results)
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        // Create canvas
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        // Render page to canvas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({
          canvasContext: context as any,
          viewport: viewport,
        } as any).promise;
        
        // Convert canvas to PNG buffer
        const pngBuffer = canvas.toBuffer('image/png');
        
        // Convert to base64
        images.push(pngBuffer.toString('base64'));
        
        this.logger.debug(`Page ${pageNum} converted successfully`);
      }
      
      this.logger.log(`PDF conversion complete. ${images.length} pages converted.`);
    } catch (error) {
      this.logger.error(`PDF conversion failed: ${(error as Error).message}`);
      throw new Error(`Failed to convert PDF: ${(error as Error).message}`);
    }

    return images;
  }

  async getFileAsBase64(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    return buffer.toString('base64');
  }

  async optimizeImage(imagePath: string): Promise<Buffer> {
    return sharp(imagePath)
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 90 })
      .toBuffer();
  }
}