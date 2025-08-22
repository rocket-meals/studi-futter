import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';

import { DatabaseTypes } from 'repo-depkit-common';
import { DateHelper } from 'repo-depkit-common';
import { WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';

export class ParseSchedule {
  private myDatabaseHelper: MyDatabaseHelper;
  private workflowRun: DatabaseTypes.WorkflowsRuns;
  private logger: WorkflowRunLogger;

  constructor(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger) {
    this.myDatabaseHelper = myDatabaseHelper;
    this.workflowRun = workflowRun;
    this.logger = logger;
  }

  async parse(): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
    await this.logger.appendLog('Starting');
    await this.logger.appendLog('this.myDatabaseHelper.apiContext exists: ' + !!this.myDatabaseHelper.apiContext);

    try {
      // Get all Canteens
      //console.log("UtilizationSchedule: load all canteens");
      await this.logger.appendLog('Loading all canteens');
      let canteens = await this.getAllCanteens();
      // For every canteen, get all cashregisters
      for (let canteen of canteens) {
        await this.calcForecastForCanteen(canteen);
      }

      await this.logger.appendLog('Finished');
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

  async calcForecastForCanteen(canteen: DatabaseTypes.Canteens) {
    //console.log("UtilizationSchedule: calc for canteen - label: "+canteen?.alias);
    await this.logger.appendLog('Calculating forecast for canteen - label: ' + canteen?.alias);
    //console.log(canteen);

    // for every canteen create a utilization group or find it
    await this.logger.appendLog('- Finding or creating utilization group for canteen: ' + canteen?.alias);
    let utilization_group_for_canteen = await this.findOrCreateOrUpdateUtilizationGroupForCanteen(canteen);

    await this.logger.appendLog('- utilization_group_for_canteen: ' + utilization_group_for_canteen?.id);
    if (utilization_group_for_canteen) {
      // delete all future utilization forecast entries for the canteen group
      //await this.deleteAllFutureUtilizationForecastEntries(utilization_group_for_canteen); Why should we delete all future entries? We should just update the existing ones

      // Have a list of all transactions
      await this.logger.appendLog('- Getting all cashregisters for canteen: ' + canteen?.alias);
      let cashregisters = await this.getAllCashregistersForCanteen(canteen);

      // calculate the prediction using as input: the transactions in the last x days, the canteen business hours
      let intervalMinutes = 15;
      let amountDaysForecast = 8;

      let dates = [];
      let today = new Date();

      today.setDate(today.getDate() - 1); // start with yesterday, so happened events can be saved as such
      for (let i = 0; i < amountDaysForecast; i++) {
        dates.push(new Date(today));
        today.setDate(today.getDate() + 1);
      }

      for (let date of dates) {
        await this.logger.appendLog('- Calculating forecast for date: ' + date.toISOString());

        await this.updateUtilizationEntryForCanteenAtDate(canteen, utilization_group_for_canteen, cashregisters, date, intervalMinutes);
      }
    } else {
      console.log('Houston we got a problem at calcForecastForCanteen');
    }
  }

  async createUtilizationEntry(utilization_group: DatabaseTypes.UtilizationsGroups, date_start: Date, date_end: Date) {
    let itemService = this.myDatabaseHelper.getUtilizationEntriesHelper();
    await itemService.createOne({
      utilization_group: utilization_group?.id,
      date_start: DateHelper.formatDateToIso8601WithoutTimezone(date_start),
      date_end: DateHelper.formatDateToIso8601WithoutTimezone(date_end),
    });
  }

  async getUtilizationEntry(utilization_group: DatabaseTypes.UtilizationsGroups, date_start: Date, date_end: Date) {
    //console.log("getUtilizationEntry");
    let itemService = this.myDatabaseHelper.getUtilizationEntriesHelper();

    let allFoundEntries = await itemService.readByQuery({
      filter: {
        _and: [
          {
            utilization_group: {
              _eq: utilization_group?.id,
            },
          },
          {
            date_start: {
              _eq: DateHelper.formatDateToIso8601WithoutTimezone(date_start),
            },
          },
          {
            date_end: {
              _eq: DateHelper.formatDateToIso8601WithoutTimezone(date_end),
            },
          },
        ],
      },
      fields: ['*'],
      limit: -1,
    });
    //console.log(allFoundEntries)
    return allFoundEntries[0];

    /**
          {
            id: 1,
            status: 'draft',
            sort: null,
            user_created: 'e2b46b90-5813-4dd7-818b-cb28900defbd',
            date_created: 1704558256553,
            user_updated: 'e2b46b90-5813-4dd7-818b-cb28900defbd',
            date_updated: 1704558879095,
            value_forecast_current: null,
            value_real: 50,
            date_start: 1703934000000,
            date_end: 1703934900000,
            utilization_group: 2
          }
         */
  }

  async countCashRegistersTransactionsForInterval(cashregisters: DatabaseTypes.Cashregisters[], date_start: Date, date_end: Date) {
    let transactions = 0;
    //console.log("")
    //console.log("countCashRegistersTransactionsForInterval")
    //console.log("cashregister_ids")
    //console.log("date_start: "+date_start.toString()+" date_end: "+date_end.toString());
    let cashregisterHelper = this.myDatabaseHelper.getCashregisterHelper();

    const realisticAverage = 6000;
    const assumedMaxLimit = realisticAverage * 10; // normally during a single day only 6000 transactions are realistic, we set a limit of 10 times that value

    for (let cashregister of cashregisters) {
      //console.log("cashregister_id: "+cashregister.id);

      // Instead we need to use the itemServiceCreator
      let transactions_ids_for_cashregister = await cashregisterHelper.getTransactionIdsForCashregister(cashregister.id, date_start, date_end, assumedMaxLimit);

      let amount_transactions_for_cashregister = transactions_ids_for_cashregister.length;
      //console.log("-- in timeslot: "+amount_transactions_for_cashregister)
      transactions += amount_transactions_for_cashregister;
    }
    //console.log("total: "+transactions)

    return transactions;
  }

  async updateUtilizationEntryForCanteenAtDate(canteen: DatabaseTypes.Canteens, utilization_group: DatabaseTypes.UtilizationsGroups, cashregisters: DatabaseTypes.Cashregisters[], date: Date, intervalMinutes: number) {
    let now = new Date();

    let interval = await this.getInterval(intervalMinutes, date);

    for (let interval_entry of interval) {
      let date_start = interval_entry.date_start;
      let date_end = interval_entry.date_end;

      let utilizationEntryCurrent = await this.getUtilizationEntry(utilization_group, date_start, date_end);
      if (!utilizationEntryCurrent) {
        // when we update an existing entry
        await this.createUtilizationEntry(utilization_group, date_start, date_end);
        utilizationEntryCurrent = await this.getUtilizationEntry(utilization_group, date_start, date_end);
      }
      //console.log("utilizationEntryCurrent");
      //console.log(utilizationEntryCurrent);

      if (!!utilizationEntryCurrent) {
        //console.log("date_start: "+date_start.toISOString()+" --> "+"date_end: "+date_end.toISOString())
        let isEntryInPast = false;
        if (date_start < now && date_end < now) {
          // if start AND end date is in the past.
          isEntryInPast = true;
        }
        //console.log("isEntryInPast: "+isEntryInPast);

        if (!isEntryInPast) {
          utilizationEntryCurrent.value_forecast_current = await this.predictUtilizationForInterval(utilization_group, cashregisters, canteen, date_start, date_end);
        }
        if (isEntryInPast) {
          // we need just to count the cash register actions
          let value_real = await this.countCashRegistersTransactionsForInterval(cashregisters, date_start, date_end);
          //console.log("value_real: "+value_real);
          utilizationEntryCurrent.value_real = value_real;

          if (!utilization_group.all_time_high || (value_real > utilization_group.all_time_high && value_real !== 0)) {
            //console.log("new all_time_high: "+value_real)
            utilization_group.all_time_high = value_real;
            let itemService = this.myDatabaseHelper.getUtilizationGroupsHelper();
            await itemService.updateOne(utilization_group.id, {
              all_time_high: value_real,
            });
          }
        }

        let itemService = this.myDatabaseHelper.getUtilizationEntriesHelper();
        await itemService.updateOne(utilizationEntryCurrent.id, utilizationEntryCurrent);
      } else {
        console.log('Houston we got a problem');
      }
    }
  }

  /**
   * Simple prediction for the utilization of a canteen, assuming the same utilization as last week
   * TODO: Implement a more sophisticated prediction
   * @param utilization_group
   * @param cashregisters
   * @param canteen
   * @param date_start
   * @param date_end
   */
  async predictUtilizationForInterval(utilization_group: DatabaseTypes.UtilizationsGroups, cashregisters: DatabaseTypes.Cashregisters[], canteen: DatabaseTypes.Canteens, date_start: Date, date_end: Date) {
    // calc forecast - kept very simple
    let date_start_last_week = new Date(date_start);
    date_start_last_week.setDate(date_start.getDate() - 7);

    let date_end_last_week = new Date(date_end);
    date_end_last_week.setDate(date_end.getDate() - 7);

    let utilizationEntryLastWeek = await this.getUtilizationEntry(utilization_group, date_start_last_week, date_end_last_week);
    let last_week_forecast_value = utilizationEntryLastWeek?.value_forecast_current; // if we want to predict beyond 7 days we need to predict using predicted values, better than displaying 0

    let value_forecast_current = utilizationEntryLastWeek?.value_real || last_week_forecast_value;
    return value_forecast_current;
  }

  async getInterval(intervalMinutes: number, date: Date) {
    let minutesPerDay = 24 * 60;
    let interval = [];
    let currentDate = new Date(date);

    currentDate.setHours(0, 0, 0, 0); // Set to start of the day (midnight)

    for (let i = 0; i < minutesPerDay; i += intervalMinutes) {
      let date_start = new Date(currentDate);
      date_start.setMinutes(i);

      let date_end = new Date(date_start);
      date_end.setMinutes(date_start.getMinutes() + intervalMinutes);

      /**
            // If the interval extends beyond midnight, correct the end time
            if (date_end.getDate() !== date_start.getDate()) {
                date_end = new Date(currentDate);
                date_end.setHours(23, 59, 59, 999);  // Set to the end of the day
            }
                */

      interval.push({
        date_start: date_start,
        date_end: date_end,
      });
    }

    return interval;
  }

  async getAllCanteens() {
    let itemService = this.myDatabaseHelper.getCanteensHelper();
    return await itemService.readByQuery({
      limit: -1,
    });
  }

  async getAllCashregistersForCanteen(canteen: DatabaseTypes.Canteens) {
    return await this.myDatabaseHelper.getCashregisterHelper().getCashregistersForCanteen(canteen.id);
  }

  async findOrCreateOrUpdateUtilizationGroupForCanteen(canteen: DatabaseTypes.Canteens) {
    //console.log("findOrCreateOrUpdateUtilizationGroupForCanteen")
    const canteenItemService = this.myDatabaseHelper.getCanteensHelper();
    let utilization_group_id = canteen?.utilization_group;
    let itemService = this.myDatabaseHelper.getUtilizationGroupsHelper();
    let foundOrCreatedGroup = null;
    if (utilization_group_id && typeof utilization_group_id === 'string') {
      // if group present, we have to update it
      //console.log("if(utilization_group_id){")
      foundOrCreatedGroup = await itemService.readOne(utilization_group_id);
    } else {
      // if no group present, we have to create one
      //console.log("} else {")
      let obj_json = {};
      let obj_id = await itemService.createOne(obj_json);
      foundOrCreatedGroup = await itemService.readOne(obj_id);
      // and link it to our canteen
      canteen.utilization_group = foundOrCreatedGroup?.id;

      await canteenItemService.updateOne(canteen.id, {
        utilization_group: foundOrCreatedGroup?.id,
      }); // update the canteen information
    }

    if (foundOrCreatedGroup) {
      // update the label
      //console.log("foundOrCreatedGroup");
      //console.log(foundOrCreatedGroup);
      await itemService.updateOne(foundOrCreatedGroup.id, {
        alias: canteen?.alias,
      });
      foundOrCreatedGroup = await itemService.readOne(foundOrCreatedGroup.id);
    } else {
      console.log('Error at findOrCreateOrUpdateUtilizationGroupForCanteen');
    }

    return foundOrCreatedGroup;
  }
}
