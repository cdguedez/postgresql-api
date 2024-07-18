import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  uploadProductFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    console.log(file);
    return { name: file.originalname, type: file.mimetype };
  }
}
