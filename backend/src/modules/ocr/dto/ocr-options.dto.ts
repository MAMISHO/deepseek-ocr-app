import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class OcrOptionsDto {
  @ApiPropertyOptional({
    description: 'Language for OCR processing',
    example: 'auto',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Output format',
    enum: ['text', 'json', 'markdown'],
    default: 'text',
  })
  @IsOptional()
  @IsIn(['text', 'json', 'markdown'])
  outputFormat?: 'text' | 'json' | 'markdown';

  @ApiPropertyOptional({
    description: 'Include confidence scores',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeConfidence?: boolean;

  @ApiPropertyOptional({
    description: 'Page range to process (e.g., "1-5" or "1,3,5")',
    example: '1-10',
  })
  @IsOptional()
  @IsString()
  pageRange?: string;
}