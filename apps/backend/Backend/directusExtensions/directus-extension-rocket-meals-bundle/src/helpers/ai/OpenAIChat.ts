import OpenAI from 'openai';
import { EnvVariableHelper } from '../EnvVariableHelper';
import { LLMInterface, LLMMessage, LLMResponse } from './LLMInterface';

export class OpenAIChat implements LLMInterface {
    protected openai: OpenAI | null = null;

    async init(): Promise<void> {
        const apiKey = EnvVariableHelper.getEnvVariable('AI_OPENAI_API_KEY') || EnvVariableHelper.getEnvVariable('LLM_OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OpenAI API key not provided');
        }
        this.openai = new OpenAI({ apiKey });
    }


    async sendRequest<T = any>(options: { messages: LLMMessage[]; sessionId?: string }): Promise<LLMResponse<T>> {
        if (!this.openai) {
            throw new Error('OpenAI not initialized');
        }
        const messages: LLMMessage[] = options.messages;
        const chatCompletion = await this.openai.chat.completions.create({
            messages: messages as any,
            model: 'gpt-3.5-turbo-0125',
            response_format: { type: 'json_object' },
        });
        const content = chatCompletion.choices[0]?.message?.content || '{}';
        const data = JSON.parse(content) as T;
        return { data, sessionId: chatCompletion.id };
    }

    async sendRequestWithJSONResponse<T>(options: { messages: LLMMessage[]; sessionId?: string }): Promise<T> {
        const response = await this.sendRequest<T>(options);
        return response.data;
    }

    getUsageCost(): number {
        return 0; // placeholder for future cost calculation
    }
}
