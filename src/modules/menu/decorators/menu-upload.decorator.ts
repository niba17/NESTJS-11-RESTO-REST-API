import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadConfig } from '../config/multer.config';

export function UseMenuImageUpload() {
  return applyDecorators(
    UseInterceptors(FileInterceptor('image', fileUploadConfig)),
  );
}
