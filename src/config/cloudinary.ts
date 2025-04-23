import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { constants } from './constants';

cloudinary.config({
  cloud_name: constants.cloudinary.name,
  api_key: constants.cloudinary.key,
  api_secret: constants.cloudinary.secret,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    // tạo stream tới cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Không có kết quả từ Cloudinary.'));
        }
      }
    );

    // đọc stream từ bộ nhớ và kết nối với stream của cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function uploadMultiple(
  images: Express.Multer.File[]
): Promise<string[]> {
  const imageUrls: string[] = [];

  for (const image of images) {
    const result = await uploadToCloudinary(image.buffer, 'questions');
    imageUrls.push(result.secure_url);
  }

  return imageUrls;
}

export async function uploadFromUrl(
  imageUrl: string,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(imageUrl, { folder }, (error, result) => {
      if (error) {
        return reject(error);
      } else if (result) {
        resolve(result);
      } else {
        reject(new Error('Không có kết quả từ Cloudinary.'));
      }
    });
  });
}
