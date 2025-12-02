import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OllamaService } from '../ollama/ollama.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly ollamaService: OllamaService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    const ollamaHealthy = await this.ollamaService.checkHealth();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: true,
        ollama: ollamaHealthy,
      },
    };
  }

  @Get('config')
  @ApiOperation({ summary: 'Get public configuration' })
  @ApiResponse({ status: 200, description: 'Public configuration' })
  async getConfig() {
    return {
      appName: this.configService.get<string>('app.name'),
      maxFileSize: this.configService.get<number>('storage.maxFileSize'),
      allowedMimeTypes: this.configService.get<string[]>('storage.allowedMimeTypes'),
      ollamaModel: this.configService.get<string>('ollama.model'),
      defaultPrompt: this.configService.get<string>('ocr.defaultPrompt'),
    };
  }
}