"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const assert_1 = __importDefault(require("assert"));
const types_1 = require("./types");
const Truffle_1 = require("./Truffle");
/**
 * A conversation class responsible for holding the state of the current conversation
 */
class Conversation {
    constructor(data, apiKey) {
        (0, assert_1.default)(data.roles.length == 2, "To converse, there have to be at least two roles. Usually, one is the user, and the other is a name for the bot. You can name these however you like! Multi-party conversations aren't supported yet though :(");
        this.client = new Truffle_1.Truffle(apiKey);
        this.systemMessage = data.system;
        this.roles = data.roles;
        this.messages = data.messages || [];
        this._data = {
            system: data.system || "",
            roles: data.roles || [],
            messages: data.messages || [],
            sepStyle: data.sepStyle || types_1.SeparatorStyle.SINGLE,
            sep: data.sep || "###",
            sep2: data.sep2 || undefined,
        };
    }
    /**
     * Returns the length of the current conversation
     * @returns An integer representing the number of characters in the conversation
     */
    getLength() {
        const prompt = this.getPrompt();
        return prompt.length;
    }
    /**
     * Returns a prompt that is properly encoded for conversation to our multi-modal model: Truffle
     * @returns A string representing the encoded prompt for inference
     */
    getPrompt() {
        let ret = "";
        switch (this._data.sepStyle) {
            case (types_1.SeparatorStyle.SINGLE): {
                ret = this._data.system + this._data.sep;
                for (let message of this.messages) {
                    ret += message.role + ": " + message.content + this._data.sep;
                }
                const other_role = this.roles.filter((role) => role != this.messages[this.messages.length - 1].role)[0];
                ret += other_role + ":";
                break;
            }
            default: {
                throw new Error("This seperator style is not yet implemented! Open a PR maybe?");
            }
        }
        return ret;
    }
    /**
     * Adds a message to a conversation
     * @param message The message that should be added to the current conversation
     */
    appendMessage(message) {
        (0, assert_1.default)(this.roles.includes(message.role), "You've gotta use one of the two roles you initialized this conversation with. You tried using: " + message.role + ", but we expected either: " + this.roles);
        if (message.image) {
            (0, assert_1.default)(message.content.includes("<image>"), "You've provided an image but not included an <image> tag in your prompt. Try re-writing your prompt. For eg: Here's an image <image> do you think this looks cool?");
        }
        this.messages.push(message);
    }
    /**
     * This function continues a conversation using the /infer endpoint
     * @param stream A boolean representing whether the response should be streamed or not
     * @returns A message that continues the conversation
     */
    async continue(stream = false) {
        let lastImage;
        for (let message of this.messages) {
            lastImage = message.image;
        }
        let response = await this.client.infer({
            prompt: this.getPrompt(),
            image: lastImage,
            stream: stream
        });
        let messages = parseMessages(response.text, this._data.sep);
        return messages[messages.length - 1];
    }
}
exports.Conversation = Conversation;
/**
 *
 * @param raw The raw strings received from de-serializing a conversation as a prompt
 * @param sep The seperator in between messages
 * @returns An array of Message objects
 */
function parseMessages(raw, sep) {
    const messages = [];
    const parts = raw.split(sep);
    for (let part of parts) {
        const messageParts = part.split(": ");
        if (messageParts.length >= 2) {
            const role = messageParts[0];
            const content = messageParts[1];
            const message = { role, content };
            messages.push(message);
        }
    }
    return messages;
}
