import { ApartmentsParseSchedule } from './ApartmentsParseSchedule';
import { StudentenwerkHannoverApartments_Parser } from './hannover/StudentenwerkHannoverApartments_Parser';
import { defineHook } from '@directus/extensions-sdk';
import { EnvVariableHelper, SyncForCustomerEnum } from '../helpers/EnvVariableHelper';
import { ApartmentParserInterface } from './ApartmentParserInterface';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { WorkflowScheduleHelper } from '../workflows-runs-hook';
import { ResultHandleWorkflowRunsWantToRun, SingleWorkflowRun, WorkflowRunJobInterface, WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { DatabaseTypes } from 'repo-depkit-common';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';

class HousingSyncWorkflow extends SingleWorkflowRun {
  private parserInterface: ApartmentParserInterface;

  constructor(parserInterface: ApartmentParserInterface) {
    super();
    this.parserInterface = parserInterface;
  }

  getWorkflowId(): string {
    return 'housing-sync';
  }

  async runJob(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
    await logger.appendLog('Starting sync housing parsing');
    try {
      const parseSchedule = new ApartmentsParseSchedule(workflowRun, myDatabaseHelper, logger, this.parserInterface);
      return await parseSchedule.parse();
    } catch (err: any) {
      await logger.appendLog('Error: ' + err.toString());
      return logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.FAILED,
      });
    }
  }
}

export default defineHook(async ({ action, init, schedule }, apiContext) => {
  let usedParser: ApartmentParserInterface | null = null;
  switch (EnvVariableHelper.getSyncForCustomer()) {
    case SyncForCustomerEnum.TEST:
      usedParser = null;
      break;
    case SyncForCustomerEnum.HANNOVER:
      usedParser = new StudentenwerkHannoverApartments_Parser();
      break;
    case SyncForCustomerEnum.OSNABRUECK:
      usedParser = null;
      break;
  }

  if (usedParser === null) {
    return;
  }

  let myDatabaseHelper = new MyDatabaseHelper(apiContext);
  WorkflowScheduleHelper.registerScheduleToRunWorkflowRuns({
    workflowRunInterface: new HousingSyncWorkflow(usedParser),
    myDatabaseHelper: myDatabaseHelper,
    schedule: schedule,
    cronOject: WorkflowScheduleHelper.EVERY_DAY_AT_4AM,
  });
});
