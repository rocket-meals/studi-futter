import {FormImportSyncWorkflow} from "../../FormImportSyncWorkflow";
import {
    HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS,
    HannoverTL1HousingFileReader,
    ImportHousingContract,
    Tl1ImportHousingContracts
} from "./HannoverTL1HousingFileReader";
import {
    FormImportSyncFormAnswer,
    FormImportSyncFormAnswers,
    FormImportSyncFormSubmissions
} from "../../FormImportTypes";
import {WorkflowResultHash} from "../../../helpers/itemServiceHelpers/WorkflowsRunHelper";
import {FormAnswers} from "../../../databaseTypes/types";
import {WorkflowRunLogger} from "../../../workflows-runs-hook/WorkflowRunJobInterface";
import {DateHelper, DateHelperTimezone} from "../../../helpers/DateHelper";


export class FormHousingContractsWorkflowHannover extends FormImportSyncWorkflow {

    static FORM_INTERNAL_ID = "housing-contract-sync-hannover";

    private reader: HannoverTL1HousingFileReader;
    private contracts: Tl1ImportHousingContracts = [];

    constructor(housingPath: string) {
        super();
        this.reader = new HannoverTL1HousingFileReader(housingPath);
    }

    getWorkflowId(): string {
        return "housing-contract-sync-hannover";
    }

    async createNeededData(logger?: WorkflowRunLogger): Promise<void> {
        let data = await this.reader.readData(logger)
        this.contracts = data;
    }

    async getCurrentResultHash(): Promise<WorkflowResultHash> {
        let hash = await this.reader.getResultHash(this.contracts);
        return new WorkflowResultHash(hash);
    }

    private static getFormImportSyncFormAnswerValue(contract: ImportHousingContract, key: keyof ImportHousingContract): Partial<FormAnswers> {
        let value_raw = contract[key];

        switch (key) {
            case HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_MIETBEGINN:
            case HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_MIETENDE:
            case HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.MIETER_AUSZUGSDATUM:
            case HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS.VERFUEGBARAB:
                // date is already in ISO format
                return {
                    value_date: value_raw
                };
            default:
                return {
                    value_string: value_raw
                };
        }
    }

    public static getFormImportSyncFormAnswer(contract: ImportHousingContract, key: keyof ImportHousingContract): FormImportSyncFormAnswer {
        let result: FormImportSyncFormAnswer = {
            external_import_id: key,
            ...FormHousingContractsWorkflowHannover.getFormImportSyncFormAnswerValue(contract, key)
        };

        return result;
    }

    private getFormImportSyncFormAnswers(contract: ImportHousingContract): FormImportSyncFormAnswers {
        let formAnswers: FormImportSyncFormAnswers = [];
        let contractKeys = Object.keys(contract) as HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS[];
        for (let key of contractKeys) {
            let formAnswer = FormHousingContractsWorkflowHannover.getFormImportSyncFormAnswer(contract, key);
            formAnswers.push(formAnswer);
        }

        return formAnswers;
    }


    async getData(logger?: WorkflowRunLogger): Promise<FormImportSyncFormSubmissions[]> {
        let result: FormImportSyncFormSubmissions[] = [];
        for (let contract of this.contracts) {
            let internal_custom_id = this.reader.getHousingContractInternalCustomId(contract);
            if(internal_custom_id !== null){
                // add form interal custom id as prefix
                internal_custom_id = `${this.getFormInternalCustomId()}-${internal_custom_id}`;

                let formSubmission: FormImportSyncFormSubmissions = {
                    alias: this.reader.getAlias(contract),
                    internal_custom_id: internal_custom_id,
                    form_answers: this.getFormImportSyncFormAnswers(contract)
                };
                result.push(formSubmission);
            }
        }
        return result;
    }

    getFormAlias(): string {
        return "Hannover Housing Contract";
    }

    getFormInternalCustomId(): string {
        return FormHousingContractsWorkflowHannover.FORM_INTERNAL_ID;
    }



}