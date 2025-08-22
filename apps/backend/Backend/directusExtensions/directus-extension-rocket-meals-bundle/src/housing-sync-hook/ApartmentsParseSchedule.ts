import { ApartmentParserInterface, ApartmentsForParser } from './ApartmentParserInterface';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { DatabaseTypes } from 'repo-depkit-common';
import { WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';

export class ApartmentsParseSchedule {
  private parser: ApartmentParserInterface;
  private myDatabaseHelper: MyDatabaseHelper;
  private workflowRun: DatabaseTypes.WorkflowsRuns;
  private logger: WorkflowRunLogger;

  constructor(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger, parser: ApartmentParserInterface) {
    this.parser = parser;
    this.myDatabaseHelper = myDatabaseHelper;
    this.workflowRun = workflowRun;
    this.logger = logger;
  }

  async parse() {
    await this.logger.appendLog('Starting');
    try {
      await this.logger.appendLog('Parsing apartments');
      let apartmentsJSONList = await this.parser.getApartmentList();

      await this.logger.appendLog('Updating apartments');
      await this.updateApartments(apartmentsJSONList);

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

  async findOrCreateApartment(apartmentForParser: ApartmentsForParser) {
    const itemService = this.myDatabaseHelper.getApartmentsHelper();
    const external_idenfifier = apartmentForParser.basicData.external_identifier;

    const searchObject = {
      external_identifier: external_idenfifier,
    };
    const createObject = searchObject;
    return await itemService.findOrCreateItem(searchObject, createObject);
  }

  async updateApartments(apartmentsForParser: ApartmentsForParser[]) {
    for (let apartmentForParser of apartmentsForParser) {
      let resource = await this.findOrCreateApartment(apartmentForParser);
      if (!!resource && resource?.id) {
        await this.updateApartment(resource.id, apartmentForParser);
      }
    }
  }

  async updateApartment(apartmentId: string, apartmentForParser: ApartmentsForParser) {
    const itemService = this.myDatabaseHelper.getApartmentsHelper();
    await itemService.updateOne(apartmentId, apartmentForParser.basicData);

    const building_data = apartmentForParser.buildingData;
    const buildingExternalIdentifier = building_data.external_identifier;
    const searchObject = {
      external_identifier: buildingExternalIdentifier,
    };
    const buildingService = this.myDatabaseHelper.getBuildingsHelper();
    const building = await buildingService.findOrCreateItem(searchObject, building_data);
    if (building) {
      const building_id = building.id;
      if (building_id) {
        // Link building to apartment
        await itemService.updateOne(apartmentId, {
          building: building_id,
        });
      }
    }
  }
}
