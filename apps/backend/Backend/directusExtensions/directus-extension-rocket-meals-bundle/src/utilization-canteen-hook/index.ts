import { ParseSchedule } from './ParseSchedule';
import { defineHook } from '@directus/extensions-sdk';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { WorkflowScheduleHelper } from '../workflows-runs-hook';
import { ResultHandleWorkflowRunsWantToRun, SingleWorkflowRun, WorkflowRunJobInterface, WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { DatabaseTypes } from 'repo-depkit-common';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';

class UtilizationCanteenCalculationWorkflow extends SingleWorkflowRun {
  getWorkflowId(): string {
    return 'utilization-canteen-calculation';
  }

  async runJob(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
    await logger.appendLog('Starting utilization canteen calculation');

    try {
      const parseSchedule = new ParseSchedule(workflowRun, myDatabaseHelper, logger);
      return await parseSchedule.parse();
    } catch (err: any) {
      await logger.appendLog('Error: ' + err.toString());
      return logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.FAILED,
      });
    }
  }
}

export default defineHook(async ({ init, action, schedule }, apiContext) => {
  let myDatabaseHelper = new MyDatabaseHelper(apiContext);

  WorkflowScheduleHelper.registerScheduleToRunWorkflowRuns({
    workflowRunInterface: new UtilizationCanteenCalculationWorkflow(),
    myDatabaseHelper: myDatabaseHelper,
    schedule: schedule,
    cronOject: WorkflowScheduleHelper.EVERY_15_MINUTES,
  });
});
