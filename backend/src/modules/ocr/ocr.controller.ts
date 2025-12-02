import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProcessBase64Dto } from './dto/process-base64.dto';
import { ProcessFileDto } from './dto/process-file.dto';
import { ProcessPathDto } from './dto/process-path.dto';
import { ProcessUrlDto } from './dto/process-url.dto';
import { OcrService } from './ocr.service';

@ApiTags('ocr')
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file for OCR processing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 52428800 }), // 50MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.ocrService.uploadFile(file);
    return { success: true, data: result };
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process uploaded file by ID' })
  @ApiResponse({ status: 200, description: 'OCR processing started' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async processFile(@Body() dto: ProcessFileDto) {
    const result = await this.ocrService.processFile(dto);
    return { success: true, data: result };
  }

  @Post('process-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process file from URL' })
  @ApiResponse({ status: 200, description: 'OCR processing result' })
  @ApiResponse({ status: 400, description: 'Invalid URL or file type' })
  async processUrl(@Body() dto: ProcessUrlDto) {
    const result = await this.ocrService.processUrl(dto);
    return { success: true, data: result };
  }

  @Post('process-base64')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process file from base64 data' })
  @ApiResponse({ status: 200, description: 'OCR processing result' })
  @ApiResponse({ status: 400, description: 'Invalid base64 data' })
  async processBase64(@Body() dto: ProcessBase64Dto) {
    const result = await this.ocrService.processBase64(dto);
    return { success: true, data: result };
  }

  @Post('process-path')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process file from server path' })
  @ApiResponse({ status: 200, description: 'OCR processing result' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async processPath(@Body() dto: ProcessPathDto) {
    const result = await this.ocrService.processPath(dto);
    return { success: true, data: result };
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get processing status' })
  @ApiResponse({ status: 200, description: 'Processing status' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getStatus(@Param('jobId') jobId: string) {
    const result = await this.ocrService.getResult(jobId);
    return { success: true, data: result };
  }

  @Get('result/:jobId')
  @ApiOperation({ summary: 'Get OCR result' })
  @ApiResponse({ status: 200, description: 'OCR result' })
  @ApiResponse({ status: 404, description: 'Result not found' })
  async getResult(@Param('jobId') jobId: string) {
    const result = await this.ocrService.getResult(jobId);
    return { success: true, data: result };
  }

  @Delete('file/:fileId')
  @ApiOperation({ summary: 'Delete uploaded file' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('fileId') fileId: string) {
    await this.ocrService.deleteFile(fileId);
    return { success: true };
  }
}