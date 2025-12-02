import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OllamaResponse {
  text: string;
  model: string;
  totalDuration?: number;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('ollama.host') || 'http://localhost:11434';
    this.model = this.configService.get<string>('ollama.model') || 'deepseek-ocr';
    this.timeout = this.configService.get<number>('ollama.timeout') || 1900000;
    this.maxRetries = this.configService.get<number>('ollama.maxRetries') || 3;
    this.retryDelay = this.configService.get<number>('ollama.retryDelay') || 1000;
  }

  async processImage(imageBase64: string, prompt: string): Promise<OllamaResponse> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(`Processing image with Ollama (attempt ${attempt}/${this.maxRetries})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'user',
                content: prompt || '\n Free OCR.',
                images: [imageBase64],
              },
            ],
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
          text: data.message?.content || '',
          model: data.model || this.model,
          totalDuration: data.total_duration,
        };
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Attempt ${attempt} failed: ${lastError.message}`);

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    this.logger.error(`All ${this.maxRetries} attempts failed`);
    throw new HttpException(
      `Failed to process image with Ollama after ${this.maxRetries} attempts: ${lastError.message}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      this.logger.error(`Ollama health check failed: ${(error as Error).message}`);
      return false;
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      this.logger.error(`Failed to get models: ${(error as Error).message}`);
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}