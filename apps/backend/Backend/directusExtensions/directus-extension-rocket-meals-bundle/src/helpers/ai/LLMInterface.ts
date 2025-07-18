export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse<T = any> {
    data: T;
    usageCost?: number;
    nextTask?: string;
    sessionId?: string;
}

export interface LLMInterface {
    init(): Promise<void>;
    sendRequest<T = any>(options: { messages: LLMMessage[]; sessionId?: string }): Promise<LLMResponse<T>>;
    getUsageCost?(): number;
}
