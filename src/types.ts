/**
 * The style of seperator, use "SINGLE" most of the time
 */
export enum SeparatorStyle {
    SINGLE = "SINGLE",
    TWO = "TWO",
    MPT = "MPT",
}

/**
 * The Truffle resource to be used
 */
export enum TruffleResource {
    FINETUNE = "finetune",
    MODEL = "model",
}

/**
 * The status of a finetuning job
 */
export enum FinetuneStatus {
    QUEUED = "QUEUED",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

/**
 * A message is given by a role, the content of that role, and an optional image passed in
 */
export type Message = {
    role: string,
    content: string,
    image?: string
}

/**
 * A conversation contains the data to create a clean conversation as opposed to standard prompt completion pairs
 */
export type ConversationData = {
    system: string,
    roles: string[],
    messages?: Message[],
    sepStyle?: SeparatorStyle,
    sep?: string,
    sep2?: string,
}

/**
 * A finetune object that corresponds to a finetuning job
 */
export type Finetune = {
    id: string,
    status: FinetuneStatus,
    data: string,
    images?: string,
    createdAt: Date,
    ranAt?: Date,
    finishedAt?: Date,
    error?: string
}


/**
 * The payload for conducting model inference
 */
export type InferencePayload = {
    model?: string;
    prompt: string;
    temperature?: number;
    tokens?: number;
    stop?: string;
    stream?: boolean;  // add the stream parameter
    image?: string;
}

/**
 * The payload for conducting batch model inference
 */
export type BatchInferencePayload = {
    model: string;
    prompts: string[];
    temperature?: number;
    tokens?: number;
    stop?: string | string[];
    stream?: boolean;
    images?: string[];
}

/**
 * The payload for conducting model finetuning
 */
export type FinetunePayload = {
    model?: string;
    data: string;
    images?: string;
    epochs?: number;
    description?: string;
}