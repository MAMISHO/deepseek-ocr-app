import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { OcrOptionsDto } from './ocr-options.dto';

export class ProcessUrlDto {
  @ApiProperty({
    description: 'URL of the file to process',
    example: 'https://example.com/document.pdf',
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    description: 'Custom prompt for OCR processing',
    example: 'Extract the text in the image.',
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