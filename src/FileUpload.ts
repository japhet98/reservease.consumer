import { Storage } from '@google-cloud/storage';
import * as multer from 'multer';

interface IFileUPload {
  projectId: string;
  storageBucket: string;
  privateKey: string;
  storageFolder: string;
  fileLimit?: number;
}

interface INewFilePayload {
  fileName: string;
  fileUrl: string;
  hostingProvider: string;
  fileType: string;
  fileSize: number;
}

export class FilUploadService {
  protected projectId: string;
  protected storageBucket: string;
  protected privateKey: string;
  protected gcStorage: Storage;
  protected storageFolder: string;
  protected hostingProvider = 'gcp-storage';
  protected fileLimit?: number = 10;
  protected isRequired:boolean = false;

  constructor(params: IFileUPload) {
    this.projectId = params.projectId;
    this.storageBucket = params.storageBucket;
    this.privateKey = params.privateKey;
    this.storageFolder = params.storageFolder;
    this.fileLimit = params.fileLimit;
    this.gcStorage = new Storage({
      projectId: this.projectId,
      credentials: JSON.parse(this.privateKey ?? ''),
    });
  }

  public getPublicUrl = (bucketName: string, fileName: string): string =>
    `https://storage.googleapis.com/${bucketName}/${fileName}`;
  public UploadToGCS = (req: any, res: any, next: any) => {
    try {
      if (!req.files) {
        return next();
      }

      const bucketName = this.storageBucket;
      const gcsBucket = this.gcStorage.bucket(bucketName);
      let promises: any = [];
      
      req.files.forEach((_file: any, index: any) => {
        const fileName = _file.originalname.toLowerCase().split(' ').join('-');

        const gcsFileName = `${this.storageFolder}/${Date.now()}-${fileName}`;
        const file = gcsBucket.file(gcsFileName);
        const size = _file.size;

        const promise = new Promise((resolve, reject) => {
          const stream = file.createWriteStream({
            metadata: {
              contentType: _file.mimetype,
            },
          });
          stream.on('error', (err) => {
            req.files[index].cloudStorageError = err;
            reject(err);
          });
          stream.on('finish', async () => {
            try {
              req.files[index].cloudStorageObject = gcsFileName;
              await file.makePublic();

              const newFile: INewFilePayload = {
                fileName: _file?.cloudStorageObject?.split(`${this.storageFolder}/`)?.[1],
                fileUrl: this.getPublicUrl(bucketName, _file?.cloudStorageObject),
                hostingProvider: this.hostingProvider,
                fileType: _file.mimetype,
                fileSize: size,
              };
              req.files[index] = newFile;
              resolve(req.files[index]);
            } catch (error: any) {
              reject(error);
            }
          });
          stream.end(_file.buffer);
        });
        promises.push(promise);
      });

      Promise.all(promises)
        .then((_) => {
          promises = [];
          next();
        })
        .catch(next);
    } catch (err) {
      next(err);
    }
  };

  public uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: (this.fileLimit ? this.fileLimit : 10) * 1024 * 1024,
    },
  });
}
