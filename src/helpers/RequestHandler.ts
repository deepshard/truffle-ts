import * as https from 'https';
import axios from 'axios';


export class RequestHandler {
    private static instance: RequestHandler;
    private baseUrl: string = 'https://api.deepshard.org';
    private constructor() {}

    static getInstance(): RequestHandler {
        if (!RequestHandler.instance) {
            RequestHandler.instance = new RequestHandler();
        }
        return RequestHandler.instance;
    }

    /**
     * Makes a GET request to the API
     * @param path The path to the endpoint
     * @param apiKey The API key to be sent in the header
     * @returns A promise that resolves with the response body
     */
    async get(path: string, apiKey?: string): Promise<any> {
        let config = { headers: {} }
        apiKey ? config.headers = { 'Authorization': "Bearer" + apiKey } : null
        let res = await axios.get(this.baseUrl+path, config);

        if (res.status >= 200 && res.status < 300) {
            return res.data
        } else {
            console.error("Request failed with status code: ", res.status)
            throw new Error(`Request failed with status code ${res.status}`);
        }
    }

    /**
     * Makes a POST request to the API
     * @param path The path to the endpoint
     * @param data The data to be sent to the endpoint
     * @param apiKey The API key to be sent in the header
     * @returns A promise that resolves with the response body
     */
    async post(path: string, data: any, apiKey?: string): Promise<any> {
        let config = { headers: {} }
        apiKey ? config.headers = { 'Authorization': "Bearer " + apiKey } : null
        let res = await axios.post(this.baseUrl+path, data, config);
        if (res.status >= 200 && res.status < 300) {
            return res.data
        } else {
            console.error("Request failed with status code: ", res.status)
            throw new Error(`Request failed with status code ${res.status}`);
        }
    }

    /**
     * Makes a POST request to the infer endpoint
     * @param path A path to the endpoint
     * @param data Data to be sent to the endpoint
     * @returns A promise that resolves with the response body
     */
    async infer(data: any, stream: boolean = false, apiKey?: string): Promise<any> {
        const options = {
            hostname: this.baseUrl,
            port: 443,
            path: '/infer',
            method: 'POST',
            headers: {
                'Authorization': "Bearer" + apiKey,
                'Content-Type': 'application/json',
            },
        };
    
        if (stream) {
            throw new Error("Streaming is not yet implemented. Try openeing a PR maybe?")
        } else {
            return new Promise((resolve, reject) => {
                let responseBody = "";
    
                const req = https.request(options, res => {
                    res.on('data', (chunk) => {
                        responseBody += chunk.toString(); // accumulate chunks into a single string
                    });
                    res.on('end', () => {
                        if (res.statusCode! >= 200 && res.statusCode! < 300) {
                            // Split the responseBody into individual JSON objects
                            const jsonStrings = responseBody.split('\x00');

                            // Parse each JSON string into an object
                            const jsonObjects = jsonStrings
                            .map(jsonString => {
                                try {
                                    return jsonString ? JSON.parse(jsonString) : undefined;
                                } catch (error) {
                                    console.info("This json string was silently failed during parsing: ", jsonString);
                                    return undefined;
                                }
                            })
                            .filter(jsonObject => jsonObject !== undefined);

                            // Resolve with the last JSON object
                            resolve(jsonObjects[jsonObjects.length - 1]);
                        } else {
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