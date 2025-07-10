import {WashingmachineParseSchedule} from "./WashingmachineParseSchedule";
import {defineHook} from "@directus/extensions-sdk";
import {CollectionNames} from "repo-depkit-common";
import {DemoWashingmachineParser} from "./testParser/DemoWashingmachineParser";
import {WashingmachineParserInterface} from "./WashingmachineParserInterface";
import {EnvVariableHelper, SyncForCustomerEnum} from "../helpers/EnvVariableHelper";
import {StudentenwerkOsnabrueckWashingmachineParser} from "./osnabrueck/StudentenwerkOsnabrueckWashingmachineParser";
import {MyDatabaseHelper} from "../helpers/MyDatabaseHelper";
import {DatabaseTypes} from "repo-depkit-common"
import {WorkflowScheduleHelper} from "../workflows-runs-hook";
import {RegisterFunctions} from "@directus/extensions";
import {SingleWorkflowRun, WorkflowRunLogger} from "../workflows-runs-hook/WorkflowRunJobInterface";
import {WORKFLOW_RUN_STATE} from "../helpers/itemServiceHelpers/WorkflowsRunEnum";


function registerWashingmachinesFilterUpdate(apiContext: any, registerFunctions: RegisterFunctions) {
    const {filter} = registerFunctions;
    // Washingmachines Jobs Creation
    filter<DatabaseTypes.Washingmachines>(CollectionNames.WASHINGMACHINES+'.items.update', async (input: DatabaseTypes.Washingmachines, {keys, collection}, eventContext) => {
        // Fetch the current item from the database
        if (!keys || keys.length === 0) {
            throw new Error("No keys provided for update");
        }
        let washingmachines_ids = keys;
        let washingmachine_new: Partial<DatabaseTypes.Washingmachines> = input;
        let new_date_finished = washingmachine_new.date_finished;

        const hasWashingmachineNewPropertyDateFinished = Object.prototype.hasOwnProperty.call(washingmachine_new, 'date_finished');

        if(hasWashingmachineNewPropertyDateFinished && new_date_finished===null){
            let myDatabaseHelper = new MyDatabaseHelper(apiContext, eventContext);
            if(!!washingmachines_ids) {
                for (let washingmachine_id of washingmachines_ids) {
                    let washingmachine_curent = await myDatabaseHelper.getWashingmachinesHelper().readOne(washingmachine_id);

                    let current_date_stated = washingmachine_curent.date_stated;
                    let current_date_finished = washingmachine_curent.date_finished;

                    if (!!current_date_stated && !!current_date_finished) { // currently washing
                        // then save it as a finished washing job
                        let time_diff = new Date(current_date_finished).getTime() - new Date(current_date_stated).getTime();
                        if (time_diff > 0) {
                            let time_hours = parseInt(time_diff / 1000 / 60 / 60 + "");
                            let time_minutes = parseInt(time_diff / 1000 / 60 % 60 + "");
                            let time_seconds = parseInt(time_diff / 1000 % 60 + "");
                            let hh_mm_ss = time_hours + ":" + time_minutes + ":" + time_seconds;

                            // check if duration out of range (more than 24 hours)
                            let isDurationOutOfRange = time_hours > 24;
                            if (isDurationOutOfRange) {
                                // no normal washing machine job can take more than 24 hours
                                // therefore we will not create a washing machine job
                                // we might have missed the start of the washing machine job
                                return input;
                            }

                            const duration_in_minutes = parseInt((time_diff / 1000 / 60)+""); // Total duration in minutes

                            // Round duration to the nearest 10-minute interval
                            const duration_rounded_10min_calculated = Math.ceil(duration_in_minutes / 10) * 10;

                            let partialWashingmachineJob: Partial<DatabaseTypes.WashingmachinesJobs> = {
                                date_start: current_date_stated,
                                date_end: current_date_finished,
                                duration_calculated: hh_mm_ss,
                                duration_in_minutes_calculated: duration_in_minutes,
                                duration_in_minutes_rounded_10min_calculated: duration_rounded_10min_calculated,
                                washingmachine: washingmachine_curent.id,
                                apartment: washingmachine_curent.apartment
                            }


                            await myDatabaseHelper.getWashingmachinesJobsHelper().createOne(partialWashingmachineJob);
                        }

                    }
                }
            }
        }

        return input;
    });
}



class WashingmachinesWorkflow extends SingleWorkflowRun {

    private usedParser: WashingmachineParserInterface;

    constructor(usedParser: WashingmachineParserInterface) {
        super();
        this.usedParser = usedParser;
    }

    getWorkflowId(): string {
        return "washingmachines-parse";
    }

    async runJob(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
        await logger.appendLog("Starting washingmachine parsing");

        const parseSchedule = new WashingmachineParseSchedule(workflowRun, myDatabaseHelper, logger, this.usedParser);
        try{
            return await parseSchedule.parse();
        } catch (err: any) {
            await logger.appendLog("Error: " + err.toString());
            return logger.getFinalLogWithStateAndParams({
                state: WORKFLOW_RUN_STATE.FAILED,
            })
        }

    }

}

export default defineHook(async (registerFunctions: RegisterFunctions, apiContext) => {
    const {action, filter, schedule} = registerFunctions;

    registerWashingmachinesFilterUpdate(apiContext, registerFunctions);

    let usedParser: WashingmachineParserInterface | null = null;
    switch (EnvVariableHelper.getSyncForCustomer()) {
        case SyncForCustomerEnum.TEST:
            usedParser = new DemoWashingmachineParser()
            break;
        case SyncForCustomerEnum.HANNOVER:
            usedParser = null
            break;
        case SyncForCustomerEnum.OSNABRUECK:
            usedParser = new StudentenwerkOsnabrueckWashingmachineParser()
            break;
    }

    if(!usedParser){
        console.log("No Parser set for Washingmachine Sync");
        return;
    }

    let myDatabaseHelper = new MyDatabaseHelper(apiContext);

    WorkflowScheduleHelper.registerScheduleToRunWorkflowRuns({
        workflowRunInterface: new WashingmachinesWorkflow(usedParser),
        myDatabaseHelper: myDatabaseHelper,
        schedule: schedule,
        cronOject: WorkflowScheduleHelper.EVERY_DAY_AT_17_59,
    });

});
