import { defineHook } from '@directus/extensions-sdk';
import { NotifySchedule } from './NotifySchedule';
import { WorkflowScheduleHelper } from '../workflows-runs-hook';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { SingleWorkflowRun, WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { DatabaseTypes } from 'repo-depkit-common';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';

class FoodNotifyWorkflow extends SingleWorkflowRun {
  getWorkflowId(): string {
    return 'food-notify';
  }

  async runJob(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
    await logger.appendLog('Starting food parsing');

    try {
      const notifySchedule = new NotifySchedule(workflowRun, myDatabaseHelper, logger);
      let aboutMealsInDays = 1;
      return await notifySchedule.notify(aboutMealsInDays);
    } catch (err: any) {
      await logger.appendLog('Error: ' + err.toString());
      return logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.FAILED,
      });
    }
  }
}

export default defineHook(async ({ action, schedule }, apiContext) => {
  let myDatabaseHelper = new MyDatabaseHelper(apiContext);

  WorkflowScheduleHelper.registerScheduleToRunWorkflowRuns({
    workflowRunInterface: new FoodNotifyWorkflow(),
    myDatabaseHelper: myDatabaseHelper,
    schedule: schedule,
    cronOject: WorkflowScheduleHelper.EVERY_DAY_AT_17_59,
  });
});
