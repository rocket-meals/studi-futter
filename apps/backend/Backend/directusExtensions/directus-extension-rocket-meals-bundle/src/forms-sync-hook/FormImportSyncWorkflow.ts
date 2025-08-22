import { SingleWorkflowRun, WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { DatabaseTypes } from 'repo-depkit-common';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';
import { FormImportSyncFormSubmissions } from './FormImportTypes';
import { WorkflowResultHash } from '../helpers/itemServiceHelpers/WorkflowsRunHelper';

export abstract class FormImportSyncWorkflow extends SingleWorkflowRun {
  constructor() {
    super();
  }

  abstract createNeededData(logger?: WorkflowRunLogger): Promise<void>;
  abstract getCurrentResultHash(): Promise<WorkflowResultHash>;
  abstract getData(logger?: WorkflowRunLogger): Promise<FormImportSyncFormSubmissions[]>;
  abstract getFormInternalCustomId(): string;
  abstract getFormAlias(): string;

  async runJob(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
    const workflowRunHelper = myDatabaseHelper.getWorkflowsRunsHelper();
    await logger.appendLog('Creating needed data.');
    await this.createNeededData(logger);

    const lastResultHash = await workflowRunHelper.getPreviousResultHash(workflowRun, logger);
    if (WorkflowResultHash.isError(lastResultHash)) {
      await logger.appendLog('Error getting previous result hash: ' + lastResultHash.message);
      return logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.FAILED,
      });
    }
    await logger.appendLog('Last result hash: ' + lastResultHash.getHash());

    const currentResultHash = await this.getCurrentResultHash();
    await logger.appendLog('Current Result Hash: ' + currentResultHash.getHash());
    if (currentResultHash.isSame(lastResultHash)) {
      await logger.appendLog('No new data found. Skipping workflow run.');
      return logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.SKIPPED,
        result_hash: currentResultHash.getHash(),
      });
    } else {
      await logger.appendLog('New data found. Running workflow.');

      // Now that we have new housing protocols, we can synchronize them with the database
      const searchForm: Partial<DatabaseTypes.Forms> = {
        internal_custom_id: this.getFormInternalCustomId(),
      };
      const createForm: Partial<DatabaseTypes.Forms> = {
        internal_custom_id: this.getFormInternalCustomId(),
        alias: this.getFormAlias(),
      };

      await logger.appendLog('Searching for form with internal_custom_id ' + this.getFormInternalCustomId());
      let form = await myDatabaseHelper.getFormsHelper().findOrCreateItem(searchForm, createForm);
      if (!form) {
        await logger.appendLog('Form not found and could not be created. Skipping workflow run.');
        return logger.getFinalLogWithStateAndParams({
          state: WORKFLOW_RUN_STATE.FAILED,
        });
      } else {
        await logger.appendLog('Form found or created with id ' + form.id);
        let formFields = await myDatabaseHelper.getFormsFieldsHelper().findItems({
          form: form.id,
        });
        let dictFormFieldExternalImportIdToFormFieldId: {
          [key: string]: DatabaseTypes.FormFields;
        } = {};
        for (let formField of formFields) {
          let external_import_id = formField.external_import_id;
          if (external_import_id) {
            dictFormFieldExternalImportIdToFormFieldId[external_import_id] = formField;
          }
        }
        //await logger.appendLog("Found " + formFields.length + " form fields.");
        //await logger.appendLog("dictFormFieldExternalImportIdToFormFieldId")
        //await logger.appendLog(JSON.stringify(dictFormFieldExternalImportIdToFormFieldId, null, 2));

        // Now we can create the form submissions or search for existing ones
        await logger.appendLog('Getting data.');
        let formSubmissions = await this.getData();
        const amountOfFormSubmissions = formSubmissions.length;
        await logger.appendLog('Amount of form submissions: ' + amountOfFormSubmissions);
        let currentIndexOfFormSubmission = 0;
        for (let formSubmission of formSubmissions) {
          currentIndexOfFormSubmission++;
          let internal_custom_id = formSubmission.internal_custom_id;
          await logger.appendLog('Processing (' + currentIndexOfFormSubmission + '/' + amountOfFormSubmissions + '): ' + internal_custom_id);
          let searchFormSubmission: Partial<DatabaseTypes.FormSubmissions> = {
            form: form.id,
            internal_custom_id: internal_custom_id, // identifier for the housing contract for future reference
          };
          let foundFormSubmission = await myDatabaseHelper.getFormsSubmissionsHelper().findFirstItem(searchFormSubmission);
          if (!foundFormSubmission) {
            //await logger.appendLog("- does not exist. Creating.");
            //await logger.appendLog(JSON.stringify(formSubmission, null, 2));
            let alias = formSubmission.alias;
            let createFormSubmission: Partial<DatabaseTypes.FormSubmissions> = {
              form: form.id,
              internal_custom_id: internal_custom_id, // identifier for the form submission for future reference
              alias: alias,
            };

            let createFormAnswers: Partial<DatabaseTypes.FormAnswers>[] = [];
            // now we need to fill the form answers with the data from the housing contract
            // iterate over all data fields of the housing contract
            let formAnswers = formSubmission.form_answers;
            for (let passedFormAnswer of formAnswers) {
              let external_import_id = passedFormAnswer.external_import_id;
              //await logger.appendLog("-- FormAnswer external_import_id: " + external_import_id);
              let formField = dictFormFieldExternalImportIdToFormFieldId[external_import_id];
              if (formField) {
                createFormAnswers.push({
                  ...passedFormAnswer,
                  form_field: formField.id,
                });
              }
            }

            // Set the form answers with provided data
            createFormSubmission.form_answers = {
              // @ts-ignore - this way directus will create the relation
              create: createFormAnswers,
              // @ts-ignore - this way directus will create the relation
              update: [],
              // @ts-ignore - this way directus will create the relation
              delete: [],
            };

            await myDatabaseHelper.getFormsSubmissionsHelper().createOne(createFormSubmission);
          } else {
            //await logger.appendLog("- already exists. Skipping.");
          }
        }
        await logger.appendLog('Finished processing all form submissions.');

        return logger.getFinalLogWithStateAndParams({
          state: WORKFLOW_RUN_STATE.SUCCESS,
          result_hash: currentResultHash.getHash(),
        });
      }
    }
  }
}
