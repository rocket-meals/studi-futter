import { defineHook } from '@directus/extensions-sdk';
import { ReportSchedule } from './ReportSchedule';
import { DatabaseInitializedCheck } from '../helpers/DatabaseInitializedCheck';
import { CollectionNames } from 'repo-depkit-common';
import { DatabaseTypes } from 'repo-depkit-common';

const SCHEDULE_NAME = 'food_feedback_report';

export default defineHook(async ({ schedule, filter }, apiContext) => {
  let allTablesExist = await DatabaseInitializedCheck.checkAllTablesExistWithApiContext(SCHEDULE_NAME, apiContext);
  if (!allTablesExist) {
    return;
  }

  const collection = CollectionNames.CANTEEN_FOOD_FEEDBACK_REPORT_SCHEDULES;

  // filter all update actions where from value running to start want to change, since this is not allowed
  filter<Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules>>(collection + '.items.update', async (modifiable_payload: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules>, meta, eventContext) => {
    const pre = collection + '.items.update ';
    //console.log(pre+"Canteen Food Feedback Report Schedule update");
    const keys = meta.keys;
    //console.log(pre+"keys: "+JSON.stringify(keys));
    //console.log(pre+"modifiable_payload: ");
    //console.log(JSON.stringify(modifiable_payload,null,2));
    // Fetch the current item from the database
    if (!keys || keys.length === 0) {
      throw new Error('No keys provided for update');
    }

    const doesModifiablePayloadHasDateNextReportIsDueSet = !!modifiable_payload.date_next_report_is_due;

    if (!doesModifiablePayloadHasDateNextReportIsDueSet) {
      const reportSchedule = new ReportSchedule(apiContext, eventContext);
      let hasAnyTimeSettingsChanged = false;
      for (const key of keys) {
        //console.log(pre+"key: "+key);
        const currentItem = await reportSchedule.getCanteenFoodFeedbackReportScheduleById(key);
        if (!!currentItem) {
          //console.log(pre+"checking if time settings have changed");
          const haveTimeSettingsChanged = ReportSchedule.haveTimeSettingsChanged(currentItem, modifiable_payload);
          //console.log(pre+"haveTimeSettingsChanged: "+haveTimeSettingsChanged);
          if (haveTimeSettingsChanged) {
            hasAnyTimeSettingsChanged = true;
            break;
          }
        }
      }
      if (hasAnyTimeSettingsChanged) {
        //console.log(pre+"time settings have changed, so reset the next report date");
        modifiable_payload.date_next_report_is_due = null; // reset the date_next_report_is_due, so it will be recalculated
      }
    }

    //console.log(collection+'.items.update finished');
    return modifiable_payload;
  });

  const parseSchedule = new ReportSchedule(apiContext);

  //console.log("Canteen Food Feedback Report Schedule schedule register");
  schedule('*/20 * * * * *', async () => {
    //console.log("Canteen Food Feedback Report Schedule run: "+new Date().toISOString());
    await parseSchedule.run();
  });
});
