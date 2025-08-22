import { ApiExtensionContext, RegisterFunctions } from '@directus/extensions';
import { MyDatabaseHelper } from '../../../helpers/MyDatabaseHelper';
import { WorkflowScheduleHelper } from '../../../workflows-runs-hook';
import { FormHousingContractsWorkflowHannover } from './FormHousingContractsWorkflowHannover';
import { EnvVariableHelper } from '../../../helpers/EnvVariableHelper';

const DIRECTUS_TL1_HOUSING_EXPORT_PATH = '/directus/tl1/housingContracts.csv'; // This is defined in docker-compose.yaml statically

export class FormSyncHannover {
  public static registerHooks(triggerContext: RegisterFunctions, apiContext: ApiExtensionContext): void {
    const myDatabaseHelper = new MyDatabaseHelper(apiContext);
    let dockerVolumeMountedPath = EnvVariableHelper.getHousingContractCsvFilePath();
    console.log('FormSyncHannover - Housing dockerVolumeMountedPath: ', dockerVolumeMountedPath);
    if (!dockerVolumeMountedPath || dockerVolumeMountedPath === '') {
      console.error('Missing env variable: HOUSING_CONTRACT_SYNC_TL1FILE_EXPORT_CSV_FILE_PATH');
      return;
    }

    // Schedule to create new form_submissions based on the provided CSV file
    WorkflowScheduleHelper.registerScheduleToRunWorkflowRuns({
      workflowRunInterface: new FormHousingContractsWorkflowHannover(DIRECTUS_TL1_HOUSING_EXPORT_PATH),
      myDatabaseHelper: myDatabaseHelper,
      schedule: triggerContext.schedule,
      cronOject: WorkflowScheduleHelper.EVERY_HOUR,
    });
  }
}
