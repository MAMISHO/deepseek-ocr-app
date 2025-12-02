import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { OcrOptionsDto } from './ocr-options.dto';

export class ProcessFileDto {
  @ApiProperty({
    description: 'ID of the uploaded file',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  fileId: string;

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