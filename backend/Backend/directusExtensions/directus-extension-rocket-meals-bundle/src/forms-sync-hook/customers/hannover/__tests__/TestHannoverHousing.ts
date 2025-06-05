// small jest test
import {describe, expect, it} from '@jest/globals';
import {
    hannoverHousingContractExamplePath,
    HannoverTL1HousingTestFileReader
} from "../HannoverTL1HousingTestFileReader";
import {
    HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS,
    HannoverTL1HousingFileReader,
    ImportHousingContract, ROCKET_MEALS_HANNOVER_HOUSING_CONTRACT_FORM_FIELDS
} from "../HannoverTL1HousingFileReader";
import {FormHousingContractsWorkflowHannover} from "../FormHousingContractsWorkflowHannover";
import {FIELD_VALUE_KEY_PREFIX, KeyOfFormAnswersValueFieldsType} from "../../../FormImportTypes";

const testFileReader = new HannoverTL1HousingTestFileReader();
const testWorkflow = new FormHousingContractsWorkflowHannover(hannoverHousingContractExamplePath);

describe("Hannover Housing Form Test", () => {

    async function getData() {
        return await testFileReader.readData();
    }

    it("Test Example", async () => {
        await testWorkflow.createNeededData();
        const data = await testWorkflow.getData();
        expect(data).not.toBeNull();
        expect(data.length).toBeGreaterThan(0);
        for(let entry of data){
            //console.log(JSON.stringify(entry, null, 2));
            expect(entry).not.toBeNull();
        }
    })

    it("all value_date must be in ISO format", async () => {
        await testWorkflow.createNeededData();
        const data = await testWorkflow.getData();
        for(let entry of data){
            for(let formAnswer of entry.form_answers){
                let value_date = formAnswer.value_date;
                if(value_date){
                    expect(value_date).toBeDefined();
                    expect(value_date).not.toBe("");
                    expect(value_date).not.toBe(NaN+"");

                    let date = new Date(value_date);
                    let isoString = date.toISOString();
                    let isIsoStringSameAsValueDate = isoString === value_date;
                    if(!isIsoStringSameAsValueDate){
                        console.log("Date is not in ISO format: ", value_date);
                        console.log("ISO format: ", isoString);
                        console.log(JSON.stringify(entry, null, 2));
                    }
                    expect(isIsoStringSameAsValueDate).toBe(true);
                }
            }

        }
    })

    it("all composite keys are required", async () => {
        let sortedKeysForHousingContractCompositeId = HannoverTL1HousingFileReader.getSortedKeysForHousingContractCompositeId();
        for(let key of sortedKeysForHousingContractCompositeId){
            let valueShouldNotBeEmpty = HannoverTL1HousingFileReader.isValueRequiredNotEmpty(key);
            if(!valueShouldNotBeEmpty){
                console.log("Composite key should be required: ", key);
                console.log("Please check: HANNOVER_TL1_EXTERNAL_HOUSING_CONTRACT_FIELDS_REQUIRED");
            }
            expect(valueShouldNotBeEmpty).toBe(true);
        }
    });

    it("all entries should have a form answer with external_import_id and at least one value field", async () => {
        const housingContracts = await getData();
        for(let housingContract of housingContracts) {
            let internalCustomId = testFileReader.getHousingContractInternalCustomId(housingContract);
            let housingContractFields = Object.values(ROCKET_MEALS_HANNOVER_HOUSING_CONTRACT_FORM_FIELDS);

            for (let housingContractField of housingContractFields) {
                let formAnswer = FormHousingContractsWorkflowHannover.getFormImportSyncFormAnswer(housingContract, housingContractField);
                //console.log("Form answer: ");
                //console.log(JSON.stringify(formAnswer, null, 2));
                expect(formAnswer).toBeDefined();
                expect(formAnswer.external_import_id).toBeDefined();
                // and at least one value field should be set
                let keys = Object.keys(formAnswer);
                let valueFieldsNames = keys.filter(key => key.startsWith(FIELD_VALUE_KEY_PREFIX));
                expect(valueFieldsNames.length).toBeGreaterThan(0);
                // and the value field should be set
                for (let valueFieldName of valueFieldsNames as KeyOfFormAnswersValueFieldsType[]) {
                    const value = formAnswer[valueFieldName];
                    expect(value).toBeDefined();
                }
            }
        }
    });

    it('test file should contain data', async () => {
        const data = await getData();
        expect(data).not.toBeNull();
        expect(data.length).toBeGreaterThan(0);
    });

    it("all entries should have all housing contract fields", async () => {
        const data = await getData();
        for (let entry of data) {
            // `keys` are the logical field names used by developers, while values are the actual field keys in the data.
            const keys = Object.values(ROCKET_MEALS_HANNOVER_HOUSING_CONTRACT_FORM_FIELDS);

            for (let key of keys) {
                let hasKey = Object.keys(entry).includes(key);
                if(hasKey){
                    const entryValue = entry[key];
                    let valueShouldNotBeEmpty = HannoverTL1HousingFileReader.isValueRequiredNotEmpty(key);
                    if(valueShouldNotBeEmpty){
                        let entryValueDefined = entryValue !== undefined && entryValue !== null && entryValue !== "" && entryValue.length > 0;
                        if(entryValueDefined){
                            expect(entryValue).not.toBeNull();
                            expect(entryValue).not.toBeUndefined();
                            expect(entryValue).not.toBe("");
                            if (entryValue) {
                                expect(entryValue.length).toBeGreaterThan(0);
                            }
                        } else {
                            console.log("Entry does not have a defined value for key: ", key);
                            console.log(JSON.stringify(entry, null, 2));
                            expect(entryValueDefined).toBe(true);
                        }
                    } else {
                        expect(entryValue).not.toBeNull();
                        expect(entryValue).not.toBeUndefined();
                    }


                } else {
                    console.log("Entry does not have key: ", key);
                    console.log(JSON.stringify(entry, null, 2));
                    expect(hasKey).toBe(true);
                }


            }
        }
    });


    it("all entries should have a unique external id", async () => {
        const data = await getData();
        const externalIds: {[key: string]: ImportHousingContract} = {};
        for (let entry of data) {
            const externalId = testFileReader.getHousingContractInternalCustomId(entry);
            if(!externalId){
                console.log("Entry does not have an external id: ");
                console.log(JSON.stringify(entry, null, 2));
                expect(externalId).toBeDefined();
            } else {
                let hasKey = Object.keys(externalIds).includes(externalId);
                if(hasKey){
                    console.log("Entry has a duplicate external id: ", externalId);
                    const existingEntry = externalIds[externalId];
                    console.log("Existing entry");
                    console.log(JSON.stringify(existingEntry, null, 2));
                    console.log("Duplicate entry");
                    console.log(JSON.stringify(entry, null, 2));
                    expect(hasKey).toBe(false);
                } else {
                    expect(externalIds[externalId]).toBeUndefined();
                    externalIds[externalId] = entry;
                }
            }
        }
    })
});