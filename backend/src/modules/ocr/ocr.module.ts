import { Module } from '@nestjs/common';
import { OllamaModule } from '../ollama/ollama.module';
import { StorageModule } from '../storage/storage.module';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';

@Module({
  imports: [OllamaModule, StorageModule],
  controllers: [OcrController],
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}