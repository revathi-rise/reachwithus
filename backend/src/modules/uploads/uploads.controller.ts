import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const randomName = Array(16)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      cb(null, `${Date.now()}-${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new BadRequestException('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
};

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadSingleImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    return this.uploadsService.processUploadedFile(file, `${req.protocol}://${req.get('host')}`);
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5, multerOptions))
  uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return files.map((file) => this.uploadsService.processUploadedFile(file, baseUrl));
  }
}
