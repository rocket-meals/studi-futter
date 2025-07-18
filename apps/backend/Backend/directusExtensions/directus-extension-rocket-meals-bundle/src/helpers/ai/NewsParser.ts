import { OpenAIChat } from './OpenAIChat';
import { LLMMessage } from './LLMInterface';

export type NewsItem = {
    title: string;
    url: string;
    date?: string;
    summary?: string;
};

export class NewsParser extends OpenAIChat {
    constructor(private url: string) {
        super();
    }

    async getCurrentNews(): Promise<NewsItem[]> {
        const systemPrompt = `Besuche die Webseite ${this.url} und parse die wichtigsten Nachrichten. Gib die Daten als JSON Array im Schema {title, url, date?, summary?} aus.`;
        const messages: LLMMessage[] = [
            { role: 'user', content: systemPrompt },
        ];
        const data = await this.sendRequestWithJSONResponse<NewsItem[]>({ messages });
        return data;
    }
}
