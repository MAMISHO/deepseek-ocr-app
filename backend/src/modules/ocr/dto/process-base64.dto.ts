import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OcrOptionsDto } from './ocr-options.dto';

export class ProcessBase64Dto {
  @ApiProperty({
    description: 'Base64 encoded file data',
  })
  @IsString()
  data: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'document.pdf',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'MIME type of the file',
    enum: ['application/pdf', 'image/png', 'image/jpeg'],
    example: 'application/pdf',
  })
  @IsIn(['application/pdf', 'image/png', 'image/jpeg'])
  mimeType: 'application/pdf' | 'image/png' | 'image/jpeg';

  @ApiPropertyOptional({
    description: 'Custom prompt for OCR processing',
  })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({
    description: 'OCR processing options',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OcrOptionsDto)
  options?: OcrOptionsDto;
}