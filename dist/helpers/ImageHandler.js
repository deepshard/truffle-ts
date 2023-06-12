"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageHandler = void 0;
const image_to_base64_1 = __importDefault(require("image-to-base64"));
const image_downloader_1 = __importDefault(require("image-downloader"));
class ImageHandler {
    constructor() { }
    static getInstance() {
        if (!ImageHandler.instance) {
            ImageHandler.instance = new ImageHandler();
        }
        return ImageHandler.instance;
    }
    async convertImageToBase64(imagePath) {
        if (imagePath.startsWith('http')) {
            const { filename } = await image_downloader_1.default.image({
                url: imagePath,
                dest: './'
            });
            imagePath = filename;
        }
        return (0, image_to_base64_1.default)(imagePath);
    }
}
exports.ImageHandler = ImageHandler;
