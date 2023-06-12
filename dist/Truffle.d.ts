import { InferencePayload } from './types';
export declare class Truffle {
    private apiKey;
    private imageHandler;
    constructor(apiKey: string);
    infer({ model, prompt, temperature, tokens, stop, stream, image }: InferencePayload): Promise<any>;
}
