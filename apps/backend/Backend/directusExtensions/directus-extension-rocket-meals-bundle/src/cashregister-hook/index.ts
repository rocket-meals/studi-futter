import { ParseSchedule } from './ParseSchedule';
import { Cashregisters_SWOSY } from './Cashregisters_SWOSY';
import { defineHook } from '@directus/extensions-sdk';
import { EnvVariableHelper, SyncForCustomerEnum } from '../helpers/EnvVariableHelper';
import { CashregisterTransactionParserInterface } from './CashregisterTransactionParserInterface';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { SingleWorkflowRun, WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { DatabaseTypes } from 'repo-depkit-common';
import { CronObject, WorkflowScheduleHelper, WorkflowScheduler } from '../workflows-runs-hook';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';

class CashRegisterWorkflow extends SingleWorkflowRun {
  private usedParser: CashregisterTransactionParserInterface;

  constructor(usedParser: CashregisterTransactionParserInterface) {
    super();
    this.usedParser = usedParser;
  }

  getWorkflowId(): string {
    return 'cashregister-parse';
  }

  async runJob(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
    await logger.appendLog('Starting cashregister parsing');

    const parseSchedule = new ParseSchedule(workflowRun, myDatabaseHelper, logger, this.usedParser);

    try {
      return await parseSchedule.parse();
    } catch (err: any) {
      await logger.appendLog('Error: ' + err.toString());
      return logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.FAILED,
      });
    }
  }
}

export default defineHook(async ({ action, init, filter, schedule }, apiContext) => {
  let usedParser: CashregisterTransactionParserInterface | null = null;
  let cronObject: CronObject | null = null;

  switch (EnvVariableHelper.getSyncForCustomer()) {
    case SyncForCustomerEnum.TEST:
      usedParser = null;
      break;
    case SyncForCustomerEnum.HANNOVER:
      usedParser = null;
      break;
    case SyncForCustomerEnum.OSNABRUECK:
      usedParser = new Cashregisters_SWOSY('https://share.sw-os.de/swosy-kassendaten-2h', `Nils:qYoTHeyPyRljfEGRWW52`);
      cronObject = WorkflowScheduleHelper.EVERY_HOUR;
      break;
  }

  if (!usedParser) {
    return;
  }

  if (!cronObject) {
    return;
  }

  let myDatabaseHelper = new MyDatabaseHelper(apiContext);

  WorkflowScheduler.registerWorkflow(new CashRegisterWorkflow(usedParser));

  WorkflowScheduleHelper.registerScheduleToCreateWorkflowRuns({
    workflowId: 'cashregister-parse',
    myDatabaseHelper: myDatabaseHelper,
    schedule: schedule,
    cronOject: cronObject,
  });
});
