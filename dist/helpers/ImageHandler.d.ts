export declare class ImageHandler {
    private static instance;
    private constructor();
    static getInstance(): ImageHandler;
    convertImageToBase64(imagePath: string): Promise<string>;
}
