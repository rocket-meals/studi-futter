import { FoodParserInterface } from './FoodParserInterface';
import { EnvVariableHelper, SyncForCustomerEnum } from '../helpers/EnvVariableHelper';
import { FoodTL1Parser_GetRawReportInterface } from './FoodTL1Parser_GetRawReportInterface';
import { FoodTL1ParserHannover } from './hannover/FoodTL1ParserHannover';
import { FoodTL1ParserOsnabrueck } from './osnabrueck/FoodTL1ParserOsnabrueck';

export class FoodParserWithCustomerAdaptions {
  static getFoodParser(rawFoodofferReader: FoodTL1Parser_GetRawReportInterface): FoodParserInterface | null {
    switch (EnvVariableHelper.getSyncForCustomer()) {
      case SyncForCustomerEnum.HANNOVER:
        return new FoodTL1ParserHannover(rawFoodofferReader);
      case SyncForCustomerEnum.OSNABRUECK:
        return new FoodTL1ParserOsnabrueck(rawFoodofferReader);
    }
    return null;
  }
}
