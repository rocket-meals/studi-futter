import { WashingmachineParserInterface, WashingmachinesTypeForParser } from './WashingmachineParserInterface';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { DatabaseTypes } from 'repo-depkit-common';
import { WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';

export class WashingmachineParseSchedule {
  private parser: WashingmachineParserInterface;
  private myDatabaseHelper: MyDatabaseHelper;
  private workflowRun: DatabaseTypes.WorkflowsRuns;
  private logger: WorkflowRunLogger;

  constructor(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger, parser: WashingmachineParserInterface) {
    this.parser = parser;
    this.myDatabaseHelper = myDatabaseHelper;
    this.workflowRun = workflowRun;
    this.logger = logger;
  }

  async parse(): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
    await this.logger.appendLog('Starting washingmachine parsing');

    try {
      await this.logger.appendLog('Getting washingmachines from parser');
      let washingmachinesForParser = await this.parser.getWashingmachines();

      await this.logger.appendLog('Updating washingmachines');
      await this.updateWashingmachines(washingmachinesForParser);

      await this.logger.appendLog('Finished washingmachine parsing');
      return this.logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.SUCCESS,
      });
    } catch (err: any) {
      await this.logger.appendLog('Error: ' + err.toString());
      return this.logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.FAILED,
      });
    }
  }

  async updateWashingmachines(washingmachinesForParser: WashingmachinesTypeForParser[]) {
    for (let washingmachine of washingmachinesForParser) {
      await this.updateWashingmachine(washingmachine);
    }
  }

  async updateWashingmachine(washingmachine: WashingmachinesTypeForParser) {
    let itemsService = this.myDatabaseHelper.getWashingmachinesHelper();

    const external_identifier = washingmachine.basicData.external_identifier;
    const searchObject = {
      external_identifier: external_identifier,
    };
    const createObject = searchObject;

    let foundItem = await itemsService.findOrCreateItem(searchObject, createObject);
    if (foundItem) {
      const existingAlias = foundItem.alias;
      const isExistingAlisNotEmpty = existingAlias && existingAlias.length > 0;
      let newAlias = isExistingAlisNotEmpty ? existingAlias : washingmachine.basicData.alias;

      let isJobStarting = foundItem.date_finished === null && washingmachine.basicData.date_finished !== null; // maybe the finish time is just extended
      let isJobEnding = washingmachine.basicData.date_finished === null; // but if the finish time is null, the job is ending

      const additionalWashingmachineData: Partial<DatabaseTypes.Washingmachines> = {};

      if (isJobStarting) {
        additionalWashingmachineData.date_stated = new Date().toISOString();
      }
      if (isJobEnding) {
        additionalWashingmachineData.date_stated = null;
      }

      await this.logger.appendLog('Updating washingmachine ' + external_identifier + ' with alias ' + newAlias);
      let partialNewWashingmachine: Partial<DatabaseTypes.Washingmachines> = {
        ...washingmachine.basicData,
        ...additionalWashingmachineData,
        alias: newAlias, // do not overwrite alias if it is already set
      };
      await this.logger.appendLog(JSON.stringify(partialNewWashingmachine, null, 2));
      await itemsService.updateOne(foundItem.id, partialNewWashingmachine);
    }
  }
}
