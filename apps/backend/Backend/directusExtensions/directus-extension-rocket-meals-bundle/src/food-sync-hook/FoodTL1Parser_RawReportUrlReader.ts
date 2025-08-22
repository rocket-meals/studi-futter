import { FoodTL1Parser_GetRawReportInterface } from './FoodTL1Parser_GetRawReportInterface';
import axios from 'axios';

export class FoodTL1Parser_RawReportUrlReader implements FoodTL1Parser_GetRawReportInterface {
  private readonly api_url: string;

  constructor(api_url: string) {
    this.api_url = api_url;
  }

  async getRawReport(): Promise<string | undefined> {
    console.log('TL1Parser_Web: getRawReport');
    console.log('TL1Parser_Web: api_url= ' + this.api_url);
    try {
      const url = this.api_url;
      const resArBuffer = await axios.request({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
      });
      let response = resArBuffer.data.toString('latin1');
      let content = Buffer.from(response, 'utf-8').toString();
      console.log('TL1 Report; length= ' + content.length);
      return content;
    } catch (err) {
      console.log('File not found yet');
    }
    return undefined;
  }
}
