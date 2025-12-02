import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
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
      
      // Dynamic import for ESM module pdf-to-img
      const { pdf } = await import('pdf-to-img');
      
      // Convert PDF pages to images
      const document = await pdf(pdfPath, { scale: 2.0 });
      
      let pageNum = 0;
      for await (const image of document) {
        pageNum++;
        // image is a Buffer containing PNG data
        const base64 = Buffer.from(image).toString('base64');
        images.push(base64);
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