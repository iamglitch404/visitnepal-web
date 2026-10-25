import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import { VerificationService } from './verification.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser } from '../middleware/auth';

const uploadDir = path.resolve(__dirname, '../../../uploads');

@Controller(['api/verification', 'api/v1/verification'])
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname) || '.jpg';
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    })
  )
  @HttpCode(HttpStatus.OK)
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.verificationService.handleUpload(file);
  }

  @Post('document')
  @HttpCode(HttpStatus.CREATED)
  async registerDocument(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.verificationService.registerDocument(user, body);
  }

  @Get('documents/:id/secure-file')
  async getSecureFile(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Res() res: Response
  ) {
    const result = await this.verificationService.getSecureFile(id, user);
    if (result.filePath) {
      return res.sendFile(result.filePath);
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      data: result.fallbackPayload,
    });
  }
}
