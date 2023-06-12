import { Message, ConversationData } from './types';
/**
 * A conversation class responsible for holding the state of the current conversation
 */
export declare class Conversation {
    private _data;
    systemMessage: string;
    roles: string[];
    messages: Message[];
    private client;
    constructor(data: ConversationData, apiKey: string);
    /**
     * Returns the length of the current conversation
     * @returns An integer representing the number of characters in the conversation
     */
    getLength(): number;
    /**
     * Returns a prompt that is properly encoded for conversation to our multi-modal model: Truffle
     * @returns A string representing the encoded prompt for inference
     */
    getPrompt(): string;
    /**
     * Adds a message to a conversation
     * @param message The message that should be added to the current conversation
     */
    appendMessage(message: Message): void;
    /**
     * This function continues a conversation using the /infer endpoint
     * @param stream A boolean representing whether the response should be streamed or not
     * @returns A message that continues the conversation
     */
    continue(stream?: boolean): Promise<Message>;
}
