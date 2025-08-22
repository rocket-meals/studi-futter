import { FoodTL1Parser_GetRawReportInterface } from './FoodTL1Parser_GetRawReportInterface';
import { SystemFileHelper } from '../helpers/SystemFileHelper';

export class FoodTL1Parser_RawReportFtpReader implements FoodTL1Parser_GetRawReportInterface {
  private path_to_tl1_export: string;
  private encoding: BufferEncoding;

  constructor(path_to_tl1_export: string, encoding: BufferEncoding) {
    this.path_to_tl1_export = path_to_tl1_export;
    this.encoding = encoding;
  }

  async getRawReport(): Promise<string | undefined> {
    return await SystemFileHelper.readFileSync(this.path_to_tl1_export, this.encoding);
  }
}
