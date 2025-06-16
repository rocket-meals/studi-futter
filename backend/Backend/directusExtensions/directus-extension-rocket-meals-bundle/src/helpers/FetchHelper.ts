import undici, { Agent } from 'undici';

const agent = new Agent({ maxHeaderSize: 32 * 1024 });

export class FetchHelper{

    static async fetchPage(url: string): Promise<string> {
        const { statusCode, body } = await undici.request(url, {
            dispatcher: agent
        });

        if (statusCode < 200 || statusCode >= 300) {
            throw new Error(`Failed to fetch news page. HTTP status ${statusCode} - Error: ${body.toString()}`);
        }

        const text = await body.text();
        return text;
    }

}
