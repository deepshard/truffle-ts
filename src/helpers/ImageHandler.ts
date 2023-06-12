import imageToBase64 from 'image-to-base64';
import download from 'image-downloader';

export class ImageHandler {
    private static instance: ImageHandler;

    private constructor() {}

    static getInstance(): ImageHandler {
        if (!ImageHandler.instance) {
            ImageHandler.instance = new ImageHandler();
        }
        return ImageHandler.instance;
    }

    async convertImageToBase64(imagePath: string): Promise<string> {
        if (imagePath.startsWith('http')) {
            const { filename } = await download.image({
                url: imagePath,
                dest: './'
            });
            imagePath = filename;
        }
        return imageToBase64(imagePath);
    }
}