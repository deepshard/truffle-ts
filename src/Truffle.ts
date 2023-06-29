// truffle.ts
import { Finetune, FinetunePayload, InferencePayload, TruffleResource, BatchInferencePayload } from './types';
import { ImageHandler } from './helpers/ImageHandler'
import { FileHandler } from './helpers/FileHandler';
import assert from 'assert';
import { RequestHandler } from './helpers/RequestHandler';


export class Truffle {
    private apiKey: string;
    private imageHandler: ImageHandler = ImageHandler.getInstance()

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }


    /**
     * Retrieves a resource from the server
     * @param resource The resource to be retrieved
     */
    async get(resource: TruffleResource, id: string): Promise<Finetune | any> {
        return await RequestHandler.getInstance().get(`/${resource}/${id}`, this.apiKey)
    }

    /**
     * Finetunes a model according to a CSV file
     * 1. First it checks if the CSV & Image files are local or remote. If remote, it downloads them.
     * 2. Then it checks if the CSV file is valid. Needs to have columns 'prompt', 'completion', and 'image'. If image is not present, images should be null, else should be a valid ZIP file.
     * 3. Checks if each image in the image folder corresponds to an image in the ZIP file.
     * 4. If everything checks out, asks server for two presigned PUT urls, one for the CSV file and one for the ZIP file.
     * 5. Uploads the files to S3.
     * 6. Sends a POST request to the server to start the finetuning job along with the presigned URLs.
     * 7. Returns the finetune object.
     * @param param0 Finetune payload
     */
    async finetune({
        model = "truffle-13b",
        data,
        images,
        epochs = 3,
        description
    }: FinetunePayload): Promise<Finetune> {
        assert(
            model == "truffle-13b",
            "truffle is the only model string that we've got, buddy."
        )
        
        let dataPath = data
        let imagesPath = images

        // Check if data is a URL or a local path
        if (data.startsWith('http')) {
            await FileHandler.getInstance().downloadFile(data, "./tmp/data.csv"); // function to download the file
            dataPath = "./tmp/data.csv"
        }
        if (images && images.startsWith('http')) {
            await FileHandler.getInstance().downloadFile(images, "./tmp/images.zip"); // function to download the file
            imagesPath = "./tmp/images.zip"
        }

        // Data and images are now localized. Lets now do file handling and verifications
        await FileHandler.getInstance().validateFinetuneCSV(dataPath, imagesPath) // function to validate the CSV file
        
        // If everything checks out, asks server for two presigned PUT urls, one for the CSV file and one for the ZIP file.
        var requests = [ FileHandler.getInstance().getPresignedUploadURL(this.apiKey) ]
        if (imagesPath) {
            requests.push(FileHandler.getInstance().getPresignedUploadURL(this.apiKey))
        }

        const responses = await Promise.all(requests)
        const dataPresignedUrl = responses[0]
        const imagesPresignedUrl = images ? responses[1] : null

        console.log("Presigned PUT URLs received. ", dataPresignedUrl, imagesPresignedUrl)
        // Uploads the files to S3.
        await Promise.all([
            FileHandler.getInstance().uploadFile(dataPresignedUrl, dataPath), // function to upload the file
            images ? FileHandler.getInstance().uploadFile(imagesPresignedUrl!, imagesPath!) : null // function to upload the file
        ])
        
        // Sends a POST request to the server to start the finetuning job along with the presigned URLs.
        const finetune = RequestHandler.getInstance().post(
            "/finetune",
            {
                model: model,
                data: dataPresignedUrl,
                images: imagesPresignedUrl,
                epochs: epochs,
                description: description
            },
            this.apiKey
        )
        return finetune
    }

      /**
     * Allows a model to generate multiple responses through the server
     * @param {object} payload - Batch inference payload.
     * @param {string} payload.model - The model to use, defaults to "truffle-13b".
     * @param {string} payload.prompt - The prompts to use.
     * @param {number} payload.temperature - The temperature setting, defaults to 0.25.
     * @param {number} payload.tokens - The number of tokens to use, defaults to 512.
     * @param {string} payload.stop - The stop sequence, defaults to "###".
     * @param {boolean} payload.stream - Whether to stream the results, defaults to false.
     * @param {string} payload.image - The image to use.
     * @returns A promise that resolves to the inference object.
     */
    async infer({
        model = "truffle-13b",
        prompt,
        temperature = 0.25,
        tokens = 512,
        stop = "###",
        stream = false,
        image
    }: InferencePayload): Promise<any> {
        assert(
            model == "truffle-13b",
            "truffle is the only model string that we've got, buddy."
        )
        if (image) {
            image = await this.imageHandler.convertImageToBase64(image)
        }
        const data = {
            model: model,
            prompt: prompt,
            temperature: temperature,
            max_new_tokens: tokens,
            stop: stop,
            images: [image],
        };
        return await RequestHandler.getInstance().infer(data, stream, this.apiKey)
    }   
    
     /**
     * Allows a model to generate multiple responses through the server
     * @param {object} payload - Batch inference payload.
     * @param {string} payload.model - The model to use, defaults to "truffle-13b".
     * @param {string[]} payload.prompts - The prompts to use.
     * @param {number} payload.temperature - The temperature setting, defaults to 0.25.
     * @param {number} payload.tokens - The number of tokens to use, defaults to 512.
     * @param {string} payload.stop - The stop sequence, defaults to "###".
     * @param {boolean} payload.stream - Whether to stream the results, defaults to false.
     * @param {string[]} payload.images - The images to use.
     * @returns A promise that resolves to an array of inferences object
     */
     async batchInfer({
        model = "truffle-13b",
        prompts,
        temperature = 0.25,
        tokens = 512,
        stop = "###",
        stream = false,
        images
    }: BatchInferencePayload): Promise<any> {
        assert(
            model == "truffle-13b",
            "truffle is the only model string that we've got, buddy."
        )
      
        const inferences = await Promise.all(prompts.map(async (prompt, index) =>
        RequestHandler.getInstance().post(
          "/infer",
          {
            model:model,
            prompt: prompt,
            temperature: temperature,
            tokens:tokens,
            stop: stop,
            stream:stream,
            image: images && images[index] ? await this.imageHandler.convertImageToBase64(images[index]) : undefined
          },
          this.apiKey
        )
      ))
    
      return inferences
    }
}