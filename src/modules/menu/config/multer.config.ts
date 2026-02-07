import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const fileUploadConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/menu',
    filename: (req, file, cb) => {
      const name = Date.now().toString();
      const ext = extname(file.originalname);
      cb(null, `${name}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(
        new BadRequestException('Only jpg, jpeg, png, & webp file allowed'),
        false,
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
};
