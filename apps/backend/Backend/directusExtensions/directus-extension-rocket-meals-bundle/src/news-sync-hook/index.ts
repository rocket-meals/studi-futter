import { NewsParseSchedule } from './NewsParseSchedule';
import { defineHook } from '@directus/extensions-sdk';
import { DemoNews_Parser } from './DemoNews_Parser';
import { NewsParserInterface } from './NewsParserInterface';
import { EnvVariableHelper, SyncForCustomerEnum } from '../helpers/EnvVariableHelper';
import { StudentenwerkHannoverNews_Parser } from './hannover/StudentenwerkHannoverNews_Parser';
import { StudentenwerkOsnabrueckNews_Parser } from './osnabrueck/StudentenwerkOsnabrueckNews_Parser';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { WorkflowScheduleHelper } from '../workflows-runs-hook';
import { SingleWorkflowRun, WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { DatabaseTypes } from 'repo-depkit-common';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';

class NewsParseWorkflow extends SingleWorkflowRun {
  private newsParserInterface: NewsParserInterface;

  constructor(newsParserInterface: NewsParserInterface) {
    super();
    this.newsParserInterface = newsParserInterface;
  }

  getWorkflowId(): string {
    return 'news-sync';
  }

  async runJob(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
    await logger.appendLog('Starting sync news parsing');
    try {
      const parseSchedule = new NewsParseSchedule(workflowRun, myDatabaseHelper, logger, this.newsParserInterface);
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
  let usedParser: NewsParserInterface | null = null;
  switch (EnvVariableHelper.getSyncForCustomer()) {
    case SyncForCustomerEnum.TEST:
      usedParser = new DemoNews_Parser();
      break;
    case SyncForCustomerEnum.HANNOVER:
      usedParser = new StudentenwerkHannoverNews_Parser();
      break;
    case SyncForCustomerEnum.OSNABRUECK:
      usedParser = new StudentenwerkOsnabrueckNews_Parser();
      break;
  }

  if (!usedParser) {
    return;
  }

  let myDatabaseHelper = new MyDatabaseHelper(apiContext);
  WorkflowScheduleHelper.registerScheduleToRunWorkflowRuns({
    workflowRunInterface: new NewsParseWorkflow(usedParser),
    myDatabaseHelper: myDatabaseHelper,
    schedule: schedule,
    cronOject: WorkflowScheduleHelper.EVERY_DAY_AT_4AM,
  });
});
