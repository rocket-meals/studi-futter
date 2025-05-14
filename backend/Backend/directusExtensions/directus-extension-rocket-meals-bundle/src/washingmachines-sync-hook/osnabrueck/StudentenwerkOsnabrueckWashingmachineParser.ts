import axios from "axios";
import {CheerioAPI, load as cheerioLoad} from 'cheerio';

import {
    WashingmachineParserInterface,
    WashingmachinesTypeForParser,
    WashingmachinesTypeForParserOmmited
} from "./../WashingmachineParserInterface";
import {DateHelper} from "../../helpers/DateHelper";

type IntercardWasher = {
    terminalNr: number,
    automateNr: number,
    intercardStatus: boolean,
    expectedFreeTimeInMinutes: number
}

export class StudentenwerkOsnabrueckWashingmachineParser implements WashingmachineParserInterface {

    static url = "https://swic.sw-os.de/smartWASH-SimpleWebClient/";
    static getAllTerminalsUrl = StudentenwerkOsnabrueckWashingmachineParser.url + "allTerminals";

    constructor() {

    }

    static getWasherExternalIdentifier(terminalNr: number, automateNr: number): string {
        return "osnabrueck_" + terminalNr + "_" + automateNr;
    }

    async getWashingmachines(simulated_now?: Date): Promise<WashingmachinesTypeForParser[]> {
        let answer: WashingmachinesTypeForParser[] = [];
        let intercardWashers = await StudentenwerkOsnabrueckWashingmachineParser.getAllTerminalFromIntercard();
        for (let i = 0; i < intercardWashers.length; i++) {
            let washer = intercardWashers[i];
            if(!!washer) {
                let external_identifier = StudentenwerkOsnabrueckWashingmachineParser.getWasherExternalIdentifier(washer.terminalNr, washer.automateNr);
                let date_finished: string | null = null
                if(washer.intercardStatus && washer.expectedFreeTimeInMinutes > 0) {
                    let date = new Date(simulated_now || new Date());
                    //console.log("Date now: " + DateHelper.formatDateToIso8601WithoutTimezone(date));
                    date.setMinutes(date.getMinutes() + washer.expectedFreeTimeInMinutes);
                    date_finished = DateHelper.formatDateToIso8601WithoutTimezone(date);
                    //console.log("Washer " + washer.terminalNr + " " + washer.automateNr + " expected free time: " + washer.expectedFreeTimeInMinutes + " Date finished: " + date_finished);
                } else {
                    date_finished = null
                }

                let washingmachine: WashingmachinesTypeForParserOmmited = {
                    external_identifier: external_identifier,
                    alias: "Washingmachine " + washer.terminalNr + " " + washer.automateNr,
                    date_updated: DateHelper.formatDateToIso8601WithoutTimezone(new Date()),
                    date_finished: date_finished
                };
                answer.push({basicData: washingmachine});
            }
        }

        let filteredWashingmachines = this.filterDuplicateWashingmachines(answer);

        return filteredWashingmachines;
    }

    /**
     * Will filter out all duplicate washingmachines and use the one with a date_finished if available
     * @param washingmachines
     */
    filterDuplicateWashingmachines(washingmachines: WashingmachinesTypeForParser[]): WashingmachinesTypeForParser[] {
        let answer: WashingmachinesTypeForParser[] = [];
        let map: Map<string, WashingmachinesTypeForParser> = new Map<string, WashingmachinesTypeForParser>();
        for (let i = 0; i < washingmachines.length; i++) {
            let washingmachine = washingmachines[i];
            if(!!washingmachine) {
                let external_identifier = washingmachine.basicData.external_identifier;
                let existing = map.get(external_identifier);
                if(!!existing) {
                    if(!!washingmachine.basicData.date_finished) {
                        map.set(external_identifier, washingmachine);
                    }
                } else {
                    map.set(external_identifier, washingmachine);
                }
            }
        }
        map.forEach((value, key) => {
            answer.push(value);
        });
        return answer;
    }


    /**
     * Get All Terminal Informations as JSON
     * @returns {Promise<Array>}
     */
    static async getAllTerminalFromIntercard(): Promise<IntercardWasher[]> {
        let html = await StudentenwerkOsnabrueckWashingmachineParser.getAllTerminalsRawFromIntercard();
        //console.log("HTML from Intercard");
        //console.log(html);
        if(!html) {
            throw new Error("No HTML from Intercard");
        }
        let washerJSON = await StudentenwerkOsnabrueckWashingmachineParser.parseTerminalsRawFromIntercardToJSON(html);
        //console.log("JSON from Intercard");
        //console.log(JSON.stringify(washerJSON, null, 2));
        return washerJSON;
    }

    /**
     * Gets the RAW informations of the terminals which is html/xml
     * @returns {Promise<null|*>}
     */
    static async getAllTerminalsRawFromIntercard(): Promise<string | null> {
        let urlForRequest = StudentenwerkOsnabrueckWashingmachineParser.getAllTerminalsUrl
        try {
            //console.log("Requesting Intercard from URL: " + urlForRequest);
            let response = await axios.get(urlForRequest); //get the html
             //get the data
            //console.log("Response from Intercard");
            //console.log(response.data);
            let data = response.data;
            //console.log("Data from Intercard");
            //console.log(data);
            if(!!data && typeof data === "string") {
                return response.data;
            }
        } catch (e: any) {
            console.error("Error getting data from Intercard");
            console.error(e.toString());
        }
        return null;
    }

    /**
     * Parse the RAW informations into a nice JSON format
     * @param html the raw informations
     * @returns {Promise<Array>} the parsed JSON
     */
    static async parseTerminalsRawFromIntercardToJSON(html: string): Promise<IntercardWasher[]> {
        let answer: IntercardWasher[] = []; // prepare an empty array to fill

        try {
            const parsedHtml: CheerioAPI = cheerioLoad(html);

            // Select each row in the table, skipping the header row
            parsedHtml("table tr").each((index, element) => {
                // Skip the first row (header)
                if (index === 0) return;

                let columns = parsedHtml(element).find('td'); // Get all columns (td) in this row

                // Ensure there are 4 columns (N5, AutomatenNr, Frei / Belegt, Zeit bis Frei)
                if (columns.length === 4) {
                    let terminalNr = parseInt(parsedHtml(columns[0]).text());
                    let automateNr = parseInt(parsedHtml(columns[1]).text());
                    let statusText = parsedHtml(columns[2]).text().toLowerCase(); // Frei / Belegt
                    let expectedFreeTime = parseInt(parsedHtml(columns[3]).text());

                    let intercardStatus: boolean = (statusText === "belegt") ? true : false;

                    // Add washer info to the answer array
                    let washer: IntercardWasher = {
                        terminalNr: terminalNr,
                        automateNr: automateNr,
                        intercardStatus: intercardStatus, // "false": not running, "true": running
                        expectedFreeTimeInMinutes: expectedFreeTime
                    };
                    answer.push(washer);
                }
            });

        } catch (e) {
            console.error("Error parsing HTML", e);
        }

        return answer;
    }


}
