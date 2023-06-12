"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Truffle = void 0;
// truffle.ts
const https = __importStar(require("https"));
const ImageHandler_1 = require("./helpers/ImageHandler");
const assert_1 = __importDefault(require("assert"));
class Truffle {
    constructor(apiKey) {
        this.imageHandler = ImageHandler_1.ImageHandler.getInstance();
        this.apiKey = apiKey;
    }
    async infer({ model = "truffle-13b", prompt, temperature = 0.25, tokens = 512, stop = "###", stream = false, image }) {
        (0, assert_1.default)(model == "truffle-13b", "truffle is the only model string that we've got, buddy.");
        if (image) {
            image = await this.imageHandler.convertImageToBase64(image);
        }
        const data = {
            model: model,
            prompt: prompt,
            temperature: temperature,
            max_new_tokens: tokens,
            stop: stop,
            images: [image],
        };
        const options = {
            hostname: 'api.deepshard.org',
            port: 443,
            path: '/infer',
            method: 'POST',
            headers: {
                'x-api-key': `${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        };
        if (stream) {
            throw new Error("Streaming is not yet implemented. Try openeing a PR maybe?");
        }
        else {
            return new Promise((resolve, reject) => {
                let responseBody = "";
                const req = https.request(options, res => {
                    res.on('data', (chunk) => {
                        responseBody += chunk.toString(); // accumulate chunks into a single string
                    });
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            // Split the responseBody into individual JSON objects
                            const jsonStrings = responseBody.split('\x00');
                            // Parse each JSON string into an object
                            const jsonObjects = jsonStrings
                                .map(jsonString => {
                                try {
                                    return jsonString ? JSON.parse(jsonString) : undefined;
                                }
                                catch (error) {
                                    console.info("This json string was silently failed during parsing: ", jsonString);
                                    return undefined;
                                }
                            })
                                .filter(jsonObject => jsonObject !== undefined);
                            // Resolve with the last JSON object
                            resolve(jsonObjects[jsonObjects.length - 1]);
                        }
                        else {
                            reject(new Error(`Request failed with status code ${res.statusCode}`));
                        }
                    });
                });
                req.on('error', (error) => {
                    reject(error);
                });
                req.write(JSON.stringify(data));
                req.end();
            });
        }
    }
}
exports.Truffle = Truffle;
