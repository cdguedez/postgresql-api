import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  uploadProductFile(file: Express.Multer.File) {
    return { name: file.originalname, type: file.mimetype };
  }
}
