import { Response } from 'express';
import {
  Controller,
  Param,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

import { FilesService } from './files.service';
import { fileFilter, fileName } from 'src/common/helpers';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      limits: { fileSize: 1048576 }, // 1MB
      storage: diskStorage({
        destination: './static/products',
        filename: fileName,
      }),
    }),
  )
  uploadProductFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${
      file.filename
    }`;
    return { secureUrl };
  }

  @Get('product/:fileName')
  findProductByName(@Res() res: Response, @Param('fileName') fileName: string) {
    const pathFile = this.filesService.findStaticFile(fileName);

    return res.sendFile(pathFile);
  }
}
