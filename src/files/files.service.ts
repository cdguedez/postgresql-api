import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  uploadProductFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return { name: file.originalname, type: file.mimetype };
  }

  findStaticFile(fileName: string) {
    const path: string = join(__dirname, '../../static/products', fileName);
    if (!existsSync(path))
      throw new BadRequestException('File not found with name: ' + fileName);
    return path;
  }
}
