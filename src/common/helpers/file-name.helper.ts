import { v4 as uuid } from 'uuid';

export const fileName = (
  req: Express.Request,
  file: Express.Multer.File,
  callBack: (error: Error | null, name: string) => void,
) => {
  if (!file) {
    return callBack(new Error('No file provided!'), '');
  }

  const fileExtension = file.mimetype.split('/')[1];

  callBack(null, `${uuid()}.${fileExtension}`);
};
