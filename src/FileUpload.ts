import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import stream from 'stream';
import sharp from 'sharp'; // Import sharp
import axios from 'axios'; // Import axios

interface IFileUpload {
  projectId: string;
  storageBucket: string;
  privateKey: string;
  storageFolder: string;
  fileLimit?: number;
  publicUrl?: string;
}

interface INewFilePayload {
  fileName: string;
  fileUrl: string;
  hostingProvider: string;
  fileType: string;
  fileSize: number;
}

export class FileUploadService {
  public projectId: string;
  public storageBucket: string;
  public privateKey: string;
  public gcStorage: Storage;
  public storageFolder: string;
  public hostingProvider = 'gcp-storage-v3';
  public fileLimit?: number = 10;
  public isRequired: boolean = false;
  public _storage = Storage;
  public _multer = multer;
  public _stream = stream;
  public publicUrl?: string;

  constructor(params: IFileUpload) {
    this.projectId = params.projectId;
    this.storageBucket = params.storageBucket;
    this.privateKey = params.privateKey;
    this.storageFolder = params.storageFolder;
    this.fileLimit = params.fileLimit;
    this.publicUrl = params.publicUrl;
    this.gcStorage = new Storage({
      projectId: this.projectId,
      credentials: JSON.parse(this.privateKey ?? ''),
    });
  }

  // Function to add watermark
  private async addWatermark(buffer: Buffer, watermarkUrl: string): Promise<Buffer> {
    const response = await axios.get(watermarkUrl, { responseType: 'arraybuffer' });
    const watermarkBuffer = Buffer.from(response.data, 'binary');
    const watermark = await sharp(watermarkBuffer).resize(100, 100).toBuffer();
    return sharp(buffer)
      .composite([{ input: watermark, gravity: 'southeast' }])
      .toBuffer();
  }

  public getPublicUrl = (bucketName: string, fileName: string, hostUrl: string = ''): string =>
    this.publicUrl === ''
      ? `https://storage.googleapis.com/${bucketName}/${fileName}`
      : `${hostUrl}${this.publicUrl}/${fileName}`;

  public UploadToGCS = (req: any, res: any, next: any) => {
    try {
      if (!req.files) {
        return next();
      }

      const bucketName = this.storageBucket;
      const gcsBucket = this.gcStorage.bucket(bucketName);
      const promises: any = [];
      const hostUrl = 'https://' + req.get('host');
      const watermarkUrl = 'https://example.com/path/to/your/watermark.png'; // External URL to your watermark image

      req.files.forEach((_file: any, index: any) => {
        const fileName = _file.originalname.toLowerCase().split(' ').join('-');
        const gcsFileName = `${this.storageFolder}/${Date.now()}-${fileName}`;
        const file = gcsBucket.file(gcsFileName);
        const size = _file.size;

        const promise = new Promise(async (resolve, reject) => {
          try {
            const watermarkedBuffer = await this.addWatermark(_file.buffer, watermarkUrl);
            const Stream = file.createWriteStream({
              metadata: {
                contentType: _file.mimetype,
              },
            });
            Stream.on('error', (err) => {
              req.files[index].cloudStorageError = err;
              reject(err);
            });
            Stream.on('finish', async () => {
              try {
                req.files[index].cloudStorageObject = gcsFileName;
                await file.makePublic();

                const newFile: INewFilePayload = {
                  fileName: _file?.cloudStorageObject?.split(`${this.storageFolder}/`)?.[1],
                  fileUrl: this.getPublicUrl(bucketName, _file?.cloudStorageObject, hostUrl),
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
            Stream.end(watermarkedBuffer);
          } catch (error) {
            reject(error);
          }
        });
        promises.push(promise);
      });

      Promise.all(promises)
        .then((_) => {
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

  public UploadBufferToGCSNew = async (data: any) =>
    new Promise((res, rej) => {
      try {
        if (!data) {
          throw new Error('No data found');
        }
        const bucketName = this.storageBucket;
        const gcsBucket = this.gcStorage.bucket(bucketName);
        const watermarkUrl =
          'https://production-property-booking-service-pdwatiowia-uc.a.run.app/api/v1/fileUpload/preview/reservease-proxy/1722300003931-watermark.webp'; // External URL to your watermark image

        const promises: any = [];

        data.forEach((_file: any, index: any) => {
          const fileName = _file.FileName.toLowerCase().split(' ').join('-');
          const gcsFileName = `documents/${Date.now()}-${fileName}`;
          const file = gcsBucket.file(gcsFileName);

          const promise = new Promise(async (resolve, reject) => {
            try {
              const bufferStream = new stream.PassThrough();
              bufferStream.end(Buffer.from(_file?.Base64Image, 'base64'));

              const watermarkedBuffer = await this.addWatermark(
                Buffer.from(_file?.Base64Image, 'base64'),
                watermarkUrl,
              );

              const uploadStream = new stream.PassThrough();
              uploadStream.end(watermarkedBuffer);

              uploadStream
                .pipe(
                  file.createWriteStream({
                    metadata: {
                      contentType: _file.FileType,
                    },
                  }),
                )
                .on('error', (err: any) => {
                  data[index].cloudStorageError = err;
                  reject(err);
                })
                .on('finish', async () => {
                  try {
                    data[index].cloudStorageObject = gcsFileName;
                    await file.makePublic();
                    const newFile: INewFilePayload = {
                      fileName: _file?.cloudStorageObject?.split(`${this.storageFolder}/`)?.[1],
                      fileUrl: this.getPublicUrl(bucketName, _file?.cloudStorageObject),
                      hostingProvider: this.hostingProvider,
                      fileType: '',
                      fileSize: 0,
                    };
                    data[index] = newFile;
                    resolve(data[index]);
                  } catch (error: any) {
                    reject(error);
                  }
                });
            } catch (error) {
              reject(error);
            }
          });
          promises.push(promise);
        });

        Promise.all(promises)
          .then((_) => {
            res(data);
          })
          .catch(rej);
      } catch (err) {
        throw err;
      }
    });
}
