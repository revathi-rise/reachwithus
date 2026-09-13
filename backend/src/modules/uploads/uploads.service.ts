import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:5000');
  }

  getFileUrl(filename: string): string {
    return `${this.baseUrl}/uploads/${filename}`;
  }

  processUploadedFile(file: Express.Multer.File, requestBaseUrl?: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: requestBaseUrl ? `${requestBaseUrl}/uploads/${file.filename}` : this.getFileUrl(file.filename),
    };
  }
}
