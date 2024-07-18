export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callBack: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file) {
    return callBack(new Error('No file provided!'), false);
  }
  if (!file.mimetype.match(/(application\/pdf|image\/(jpg|jpeg|png))$/)) {
    return callBack(new Error('Invalid file type!'), false);
  }
  callBack(null, true);
};
