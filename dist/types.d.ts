/**
 * The style of seperator, use "SINGLE" most of the time
 */
export declare enum SeparatorStyle {
    SINGLE = "SINGLE",
    TWO = "TWO",
    MPT = "MPT"
}
/**
 * A message is given by a role, the content of that role, and an optional image passed in
 */
export type Message = {
    role: string;
    content: string;
    image?: string;
};
/**
 * A conversation contains the data to create a clean conversation as opposed to standard prompt completion pairs
 */
export type ConversationData = {
    system: string;
    roles: string[];
    messages?: Message[];
    sepStyle?: SeparatorStyle;
    sep?: string;
    sep2?: string;
};
/**
 * The payload for conducting model inference
 */
export type InferencePayload = {
    model?: string;
    prompt: string;
    temperature?: number;
    tokens?: number;
    stop?: string;
    stream?: boolean;
    image?: string;
};
