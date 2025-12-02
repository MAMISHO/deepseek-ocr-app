import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { OcrOptionsDto } from './ocr-options.dto';

export class ProcessPathDto {
  @ApiProperty({
    description: 'Server path to the file',
    example: '/uploads/document.pdf',
  })
  @IsString()
  path: string;

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