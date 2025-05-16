import fs, {readFileSync} from "fs";
import chardet from "chardet";
import {CSVExportParser} from "../../../food-sync-hook/CSVExportParser";
import {HashHelper} from "../../../helpers/HashHelper";
import iconv from 'iconv-lite';
import {WorkflowRunLogger} from "../../../workflows-runs-hook/WorkflowRunJobInterface";
import {DateHelper, DateHelperTimezone} from "../../../helpers/DateHelper";
import {StringHelper} from "../../../helpers/StringHelper";

// VONUMMER: Haus-Wohnung-Wohnungsnummer
// 420-01-05-51-6
// 420 kostenstelle K sicheralle
// 51-6 Zimmer nummer
// B2-7

// "420";"Karl-Wiechert-Allee";197312;"Kabulova";"Aigerim";"420-01-05-51-6";01.10.2024;31.05.2025;28.02.2025;"+77056202001";"aigerimkabulova.b@gmail.com"
// "420";"Karl-Wiechert-Allee";197312;"Kabulova";"Aigerim";"420-01-05-51-7";01.10.2024;31.05.2025;28.02.2025;"+77056202001";"aigerimkabulova.b@gmail.com"
// Hier gibt es Dubletten: Herr Kabulova, hat

// MIETERNUMMER Eindeutig
// VONUMMER Eindeutig
// MIETBEGINN Eindeutig

export enum HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS {
    WOHNUNGSNUMMER = "WHNR", // Wohnungsnummer
    WOHNUNGSNAME = "WHNAME", // Wohnungsname
    VERWALTUNGSOBJEKT_NUMMER = "VONUMMER", // Verwaltungsobjekt Nummer
    MIETER_PERSONENNUMMER = "PERSONNR", // Mieter Personennummer
    MIETER_PERSON_NACHNAME = "NAME", // Mieter Nachname
    MIETER_PERSON_VORNAME = "VORNAME", // Mieter Vorname
    MIETER_MIETBEGINN = "MIETBEGINN", // Mieter Mietbeginn
    MIETER_MIETENDE = "MIETENDE", // Mieter Mietende
    MIETER_AUSZUGSDATUM = "AUSZUG", // Mieter Auszugsdatum
    MIETER_TELEFON_MOBILE = "TELEFONMOBIL", // Mieter Telefon Mobil
    MIETER_EMAIL = "EMAIL", // Mieter Email
    VERFUEGBARAB = "VERFUEGBARAB", // Verfügbar ab
    ZIMMERNR = "ZIMMERNR", // Zimmernummer
    WOHNHEIM_EMAIL = "WH_EMAIL", // Wohnheim Email
}

const HOUSING_CONTRACT_FIELDS_FOR_ID: HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS[] = [
    HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.VERWALTUNGSOBJEKT_NUMMER,
    HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_PERSONENNUMMER,
    HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_MIETBEGINN
].sort(); // sort the keys to ensure the order is always the same, so even when the order of the fields defined above changes, the id stays the same

const HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS_REQUIRED: Record<HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS, boolean> = {
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.WOHNUNGSNUMMER]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.WOHNUNGSNAME]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.VERWALTUNGSOBJEKT_NUMMER]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_PERSONENNUMMER]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_PERSON_NACHNAME]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_PERSON_VORNAME]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_MIETBEGINN]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_MIETENDE]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_AUSZUGSDATUM]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_TELEFON_MOBILE]: false,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_EMAIL]: false,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.VERFUEGBARAB]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.ZIMMERNR]: true,
    [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.WOHNHEIM_EMAIL]: false,
}

// Define the type for ImportHousingContract
export type ImportHousingContract = {
    [key in HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS]: string;
};

export type Tl1ImportHousingContracts = ImportHousingContract[]



export interface HannoverHousingFileReaderInterface {
    readData(): Promise<Tl1ImportHousingContracts>
    getHousingContractInternalCustomId(housingContract: ImportHousingContract): string | null // returns a unique identifier for the housing contract; null if not possible and a field is missing
    getAlias(housingContract: ImportHousingContract): string | null // returns a unique identifier for the housing contract; null if not possible and a field is missing
    getResultHash(TL1ImportHousingContracts: Tl1ImportHousingContracts): string
}

export class HannoverTL1HousingFileReader implements HannoverHousingFileReaderInterface {

    private path_to_file: string;
    private logger?: WorkflowRunLogger;

    constructor(path_to_file: string) {
        this.path_to_file = path_to_file;
    }

    async readData(logger?: WorkflowRunLogger): Promise<Tl1ImportHousingContracts> {
        this.logger = logger;
        if(logger){
            await logger.appendLog("Reading data");
        }

        // check if file exists
        const fileExists = fs.existsSync(this.path_to_file);
        if(!fileExists){
            if(logger){
                await logger.appendLog("No file existing to read from");
            }
            return [];
        }

        let encoding = chardet.detect(fs.readFileSync(this.path_to_file));
        //console.log("Encoding detected: ", encoding);
        if(logger){
            await logger.appendLog("Reading data from: " + this.path_to_file);
        }

        if(!encoding){
            throw new Error("Could not detect encoding");
        }

        let rawReport = "";
        if (encoding.toLowerCase() === "windows-1252") {
            encoding = "win1252"; // iconv-lite supports this alias
            const rawBuffer = readFileSync(this.path_to_file);
            rawReport = iconv.decode(rawBuffer, encoding);
        } else {
            const csvContent = readFileSync(this.path_to_file, encoding as BufferEncoding);
            rawReport = csvContent;
        }

        if(logger){
            await logger.appendLog("File read successfully, now parsing");
        }

        let jsonListFromCsvString = CSVExportParser.getListOfLineObjects(rawReport, {
            newLineDelimiter: CSVExportParser.NEW_LINE_DELIMITER,
            inlineDelimiter: CSVExportParser.INLINE_DELIMITER_SEMICOLON,
            removeTailoringQuotes: true
        });
        let result: Tl1ImportHousingContracts = jsonListFromCsvString as Tl1ImportHousingContracts;

        if(logger){
            await logger.appendLog("CSV parsed successfully, now correcting date values");
        }

        for(let i = 0; i < result.length; i++){
            if(logger){
                await logger.appendLog("Correcting date values for housing contract from line " + (i+1) + " of " + result.length);
            }
            let housingContract = result[i];
            if(housingContract){
                result[i] = await this.correctDateValues(housingContract);
            }
        }

        return result;
    }

    private async correctDateValues(housingContract: ImportHousingContract): Promise<ImportHousingContract> {
        let result: ImportHousingContract = {
            ...housingContract
        };

        if(this.logger){
            await this.logger.appendLog("Getting wohnheim email for housing contract:");
        }
        result.WH_EMAIL = this.getWohnheimEmail(housingContract);
        if(this.logger){
            await this.logger.appendLog("Wohnheim email: " + result.WH_EMAIL);
        }

        if(this.logger){
            await this.logger.appendLog("Fixing zimmernummer for housing contract:");
        }
        result = this.fixZimmernummer(result);
        if(this.logger){
            await this.logger.appendLog("Zimmernummer fixed: " + result.ZIMMERNR);
        }


        for(let key of [HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_MIETBEGINN, HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_MIETENDE, HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_AUSZUGSDATUM]){
            let value = housingContract[key];
            if(value){
                let date = DateHelper.formatDDMMYYYYToDateWithTimeZone(value, DateHelperTimezone.GERMANY);
                result[key] = date.toISOString()
            }
        }

        return result;
    }

    private fixZimmernummer(housingContract: ImportHousingContract): ImportHousingContract {
        // Mail mit Wiebesiek 16.05.2025 - 15:17
        // e.G. "21-3" -> "213"
        let zimmernummer = housingContract[HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.ZIMMERNR];
        if(zimmernummer){
            zimmernummer = StringHelper.replaceAll(zimmernummer, "-", "");
        }
        housingContract[HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.ZIMMERNR] = zimmernummer;

        return housingContract;
    }

    getResultHash(TL1ImportHousingContracts: Tl1ImportHousingContracts): string {
        return HashHelper.hashFromObject(TL1ImportHousingContracts);
    }

    private getValue(housingContract: ImportHousingContract, field: HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS): string | null {
        if(field=== HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.WOHNHEIM_EMAIL){
            return this.getWohnheimEmail(housingContract);
        }

        let value = housingContract[field];
        if(!value){
            return null;
        }
        return value;
    }

    /**
     * email address for the given housing contract.
     * Mail: Martin Gertz: 15.05.2025
     * @private
     */
    private static WOHNHEIM_NUMMER_TO_EMAIL: Record<string, string> = {
        "Bischofsholer Damm": "whl-bida@studentenwerk-hannover.de",
        "Hufelandstraße": "WHL-Hu@studentenwerk-hannover.de",
        "Jägerstraße": "whl-jae@studentenwerk-hannover.de",
        "Am Georgengarten": "whl-ge@studentenwerk-hannover.de",
        "Schneiderberg": "WHL-Sn@studentenwerk-hannover.de",
        "Dorotheenstraße": "whl-do@studentenwerk-hannover.de",
        "Internationales Quartier": "whl-do@studentenwerk-hannover.de", // gleiche Mail wie Dorotheenstraße
        "MHH-Wohnhäuser": "whl-mhh@studentenwerk-hannover.de",
        "Haus Am Berggarten": "WHL-Hal@studentenwerk-hannover.de",
        "Callinstraße 25": "whl-ca@studentenwerk-hannover.de",
        "Callinstraße 18": "whl-ca@studentenwerk-hannover.de", // gleiche Mail wie Callinstraße 25
        "Karl-Wiechert-Allee": "WHL-Kawi@studentenwerk-hannover.de",
        "Nobelring": "WHL-No@studentenwerk-hannover.de",
        "Ritter-Brüning-Straße": "whl-rbs@studentenwerk-hannover.de",
        "Studentenwohnhaus Klaus Bahlsen": "WHL-SKB@studentenwerk-hannover.de",
        "Emdenstraße": "WHL-Em@studentenwerk-hannover.de",
        "Garbsen": "whl-ga@studentenwerk-hannover.de",
        "Heidjerhof": "WHL-Heidjer@studentenwerk-hannover.de",
        "Am Papehof": "WHL-pa@studentenwerk-hannover.de",
        "Menschingstr": "WHL-me@studentenwerk-hannover.de",
    };

    private getWohnheimEmail(housingContract: ImportHousingContract): string {
        let wohnheimName = this.getValue(housingContract, HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.WOHNUNGSNAME);
        if(!wohnheimName){
            return "";
        }

        //console.log("Getting wohnheim email for wohnheimname: ", wohnheimName);
        let wohnheimEmail = HannoverTL1HousingFileReader.WOHNHEIM_NUMMER_TO_EMAIL[wohnheimName];
        if(!wohnheimEmail){
            //console.log("No email found for wohnheimname: ", wohnheimName);
            return "";
        } else {
            //console.log("Found email for wohnheimname: ", wohnheimName, " -> ", wohnheimEmail);
            return wohnheimEmail;
        }
    }

    getAlias(housingContract: ImportHousingContract): string {
        let id = this.getHousingContractInternalCustomId(housingContract);

        let partialIds: (string | null)[] = [];

        let wohnheimname = this.getValue(housingContract, HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.WOHNUNGSNAME);
        partialIds.push(wohnheimname);
        let nachname = this.getValue(housingContract, HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_PERSON_NACHNAME);
        partialIds.push(nachname);
        let mietendeRaw = this.getValue(housingContract, HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_MIETENDE);
        let mietende: string | null = null;
        if(mietendeRaw){
            let date = new Date(mietendeRaw);
            mietende = DateHelper.getHumanReadableDate(date, false);
        }
        partialIds.push(mietende);

        // if any partial id is missing, return id
        let allPartialIdsDefined = true;
        for(let partialId of partialIds){
            if(!allPartialIdsDefined){
                break;
            }
            if(!partialId) {
                allPartialIdsDefined = false;
            }
        }

        if(allPartialIdsDefined){
            return partialIds.join(" ");
        } else {
            return id || "";
        }
    }

    private getPartialExternalId(housingContract: ImportHousingContract, field: HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS): string | null {
        let value = housingContract[field];
        if(!value){
            return null;
        }
        return `${field}_${housingContract[field]}`;
    }

    static isValueRequiredNotEmpty(field: HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS): boolean {
        // if field is in composite id, it is required
        if(HOUSING_CONTRACT_FIELDS_FOR_ID.includes(field)){
            return true;
        }
        return HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS_REQUIRED[field];
    }

    public static getSortedKeysForHousingContractCompositeId(): HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS[] {
        let sortedKeysForHousingContractCompositeId = HOUSING_CONTRACT_FIELDS_FOR_ID.sort();
        return sortedKeysForHousingContractCompositeId;
    }

    getHousingContractInternalCustomId(housingContract: ImportHousingContract): string | null {
        let partialIds: (string | null)[] = [];

        let sortedKeysForHousingContractCompositeId = HannoverTL1HousingFileReader.getSortedKeysForHousingContractCompositeId();
        for(let partialKey of sortedKeysForHousingContractCompositeId){
            let partialId = this.getPartialExternalId(housingContract, partialKey);
            if(!partialId){
                return null;
            }
            partialIds.push(partialId);
        }

        return partialIds.join("-");
    }

}