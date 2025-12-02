import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('storage.localPath') || './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix = uuidv4();
            const ext = extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
          },
        }),
        limits: {
          fileSize: configService.get<number>('storage.maxFileSize') || 52428800,
        },
        fileFilter: (req, file, cb) => {
          const allowedMimes = configService.get<string[]>('storage.allowedMimeTypes') || [
            'application/pdf',
            'image/png',
            'image/jpeg',
          ];
          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`), false);
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [StorageService],
  exports: [StorageService, MulterModule],
})
export class StorageModule {}