import {HannoverTL1HousingFileReader} from "./HannoverTL1HousingFileReader";
import {resolve} from "path";

export const hannoverHousingContractExamplePath = resolve(__dirname, 'exampleData/whv_auszuege_server.csv');
//const realCsvPath = resolve(__dirname, 'exampleData/WohnungsWechsel.csv');

export class HannoverTL1HousingTestFileReader extends HannoverTL1HousingFileReader {

    constructor() {
        super(hannoverHousingContractExamplePath);
    }

}