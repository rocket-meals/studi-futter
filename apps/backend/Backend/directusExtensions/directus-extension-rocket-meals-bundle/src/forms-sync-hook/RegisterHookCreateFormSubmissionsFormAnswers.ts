import { CollectionNames } from 'repo-depkit-common';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { DatabaseTypes } from 'repo-depkit-common';
import { PrimaryKey } from '@directus/types';
import { RegisterFunctions } from '@directus/extensions';
import { ApiContext } from '../helpers/ApiContext';

/**
 * This function registers a hook to create form_answers for a form_submission before it is created. So that the form_answers are created according to the selected form.
 * @param registerFunctions
 * @param apiContext
 */
export function registerHookToCreateFormAnswersForFormSubmission(registerFunctions: RegisterFunctions, apiContext: ApiContext) {
  registerFunctions.filter<Partial<DatabaseTypes.FormSubmissions>>(CollectionNames.FORM_SUBMISSIONS + '.items.create', async (input, meta, eventContext) => {
    let myDatabaseHelper = new MyDatabaseHelper(apiContext, eventContext);

    let form_id: PrimaryKey | undefined = undefined;
    console.log('filter create form submission');
    console.log('input');
    console.log(JSON.stringify(input, null, 2));
    console.log('form_answers');
    console.log(JSON.stringify(input?.form_answers, null, 2));

    // Check if the form is set
    if (!!input.form) {
      if (typeof input.form === 'string') {
        form_id = input.form;
      } else {
        form_id = input.form.id;
      }
    }
    if (!form_id) {
      throw new Error('Form ID is not set. Please select a form.');
    }

    // Check which form_answers are already passed
    // @ts-ignore - this way directus will create the relation
    let passedCreateFormAnswers: Partial<FormAnswers>[] = input.form_answers?.create || [];
    let passedCreateFormAnswerFieldIdsDict: {
      [key: string]: Partial<DatabaseTypes.FormAnswers>;
    } = {};
    for (let formAnswer of passedCreateFormAnswers) {
      let formFieldOfFormAnswer = formAnswer.form_field;
      let formFieldIdOfFormAnswer: string | undefined = undefined;
      if (typeof formFieldOfFormAnswer === 'string') {
        formFieldIdOfFormAnswer = formFieldOfFormAnswer;
      } else if (formFieldOfFormAnswer && typeof formFieldOfFormAnswer === 'object') {
        formFieldIdOfFormAnswer = formFieldOfFormAnswer.id;
      }
      if (!!formFieldIdOfFormAnswer) {
        passedCreateFormAnswerFieldIdsDict[formFieldIdOfFormAnswer] = formAnswer;
      }
    }

    // so now we have the form_id. We can now get the form and all form_fields
    let form = await myDatabaseHelper.getFormsHelper().findFirstItem({
      id: form_id,
    });
    if (!form) {
      throw new Error('Form not found. Please create a form first or select a valid form.');
    }
    let form_fields = await myDatabaseHelper.getFormsFieldsHelper().findItems({
      form: form_id,
    });

    // now we want to add all form_fields that are not yet in the passedCreateFormAnswers
    let createFields: Partial<DatabaseTypes.FormAnswers>[] = passedCreateFormAnswers;
    for (let form_field of form_fields) {
      if (passedCreateFormAnswerFieldIdsDict[form_field.id]) {
        continue; // we already have a form_answer for this form_field
      } else {
        createFields.push({
          form_field: form_field.id,
        });
      }
    }

    // Set the computed form_answers to the input
    input.form_answers = {
      // @ts-ignore - this way directus will create the relation
      create: createFields,
      // @ts-ignore - this way directus will create the relation
      update: input.form_answers?.update || [],
      // @ts-ignore - this way directus will create the relation
      delete: input.form_answers?.delete || [],
    };

    return input;
  });
}
