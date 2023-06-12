import * as https from 'https';
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import axios from 'axios';
import csv from 'csv-parser';
import * as yauzl from 'yauzl';


const pipeline = promisify(stream.pipeline);

export class FileHandler {
    private static instance: FileHandler;

    private constructor() {}

    public static getInstance(): FileHandler {
        if (!FileHandler.instance) {
            FileHandler.instance = new FileHandler();
        }
        return FileHandler.instance;
    }

    async downloadFile(url: string, destPath: string): Promise<void> {
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
            });

            await pipeline(response.data, fs.createWriteStream(destPath));
        } catch (error) {
            console.error(`File download failed: ${error}`);
            throw error;
        }
    }

    async uploadFile(presignedUrl: string, filePath: string): Promise<void> {
        try {
            const fetch = require("node-fetch");
            const data = fs.readFileSync(filePath);
            let response = await fetch(presignedUrl, {
                method: 'PUT',
                body: data,
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            })
            console.log("File uploaded successfully: ", response)
        } catch (error) {
            console.error(`File upload failed: ${error}`);
            throw error;
        }
    }

    /**
     * Retrieves a presigned URL for uploading a file to S3
     */
    async getPresignedUploadURL(apiKey: string): Promise<string> {
        try {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'api.deepshard.org',
                    port: 443,
                    path: '/data/upload/url',
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + apiKey
                    }
                };

                const req = https.request(options, res => {
                    res.setEncoding('utf8');
                    let responseBody = '';

                    res.on('data', chunk => {
                        responseBody += chunk;
                    });

                    res.on('end', () => {
                        const data = JSON.parse(responseBody);
                        resolve(data.url);
                    });
                });

                req.on('error', err => {
                    reject(err);
                });

                req.end();
            });
        } catch (error: any) {
            throw new Error(`Failed to get presigned upload URL: ${error.message}`);
        }
    }

    /**
     * 
     * @param data 
     * @param images 
     */
    async validateFinetuneCSV(data: string, images?: string) {
        try {
            const results: Array<{prompt: string, completion: string, image?: string}> = [];
            const file = fs.readFileSync(data, 'utf8')
            await pipeline(
                stream.Readable.from(file),
                csv(),
                new stream.Writable({
                    objectMode: true,
                    write(chunk, encoding, callback) {
                        console.log(chunk)
                        results.push(chunk);
                        callback();
                    }
                })
            );
            console.log(results)
            const headers = Object.keys(results[0]);
            if (!headers.includes('prompt') || !headers.includes('completion')) {
                throw new Error('CSV must include "prompt" and "completion" columns');
            }
    
            if (headers.includes('image')) {
                if (images === null) {
                    console.log(headers.includes('image'), images)
                    throw new Error('CSV includes "image" column but "images" parameter is null');
                }
                for(let row of results){
                    if(row.image == null || row.image == ''){
                        throw new Error('CSV includes "image" column but there is a null or empty string value');
                    }
                }
    
                const imageNames = new Set(results.map(row => row.image));
                yauzl.open(images!, {lazyEntries: true}, (err, zipfile) => {
                    if (err) throw err;
                    zipfile.readEntry();
                    zipfile.on('entry', (entry) => {
                        if (imageNames.has(entry.fileName)) {
                            imageNames.delete(entry.fileName);
                        }
                        zipfile.readEntry();
                    });
                    zipfile.on('end', () => {
                        if (imageNames.size > 0) {
                            throw new Error(`Missing image files: ${Array.from(imageNames).join(', ')}`);
                        }
                    });
                });
            }
        } catch (error) {
            console.error(`Validation failed: ${error}`);
            throw error;
        }
    }
}