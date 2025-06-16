import {NewsParserInterface, NewsTypeForParser} from "./NewsParserInterface";
import {TranslationHelper} from "../helpers/TranslationHelper";
import {MyDatabaseHelper} from "../helpers/MyDatabaseHelper";
import {News, WorkflowsRuns} from "../databaseTypes/types";
import {CollectionNames} from "../helpers/CollectionNames";
import {WorkflowRunLogger} from "../workflows-runs-hook/WorkflowRunJobInterface";
import {WORKFLOW_RUN_STATE} from "../helpers/itemServiceHelpers/WorkflowsRunEnum";
import {WorkflowResultHash} from "../helpers/itemServiceHelpers/WorkflowsRunHelper";
import {HashHelper} from "../helpers/HashHelper";

export class NewsParseSchedule {

    //TODO stringfiy and cache results to reduce dublicate removing from foodOffers and Meals ...
    private parser: NewsParserInterface;
    private myDatabaseHelper: MyDatabaseHelper;
    private logger: WorkflowRunLogger;
    private workflowRun: WorkflowsRuns;

    constructor(workflowRun: WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger, parser: NewsParserInterface) {
        this.workflowRun = workflowRun;
        this.myDatabaseHelper = myDatabaseHelper;
        this.logger = logger;
        this.parser = parser;
    }

    async getPreviousHash() {
        return await this.myDatabaseHelper.getWorkflowsRunsHelper().getPreviousResultHash(this.workflowRun, this.logger);
    }

    async parse(): Promise<Partial<WorkflowsRuns>> {
        await this.logger.appendLog("Starting sync news parsing");

        try {
            await this.logger.appendLog("Getting news items");
            let newsJSONList = await this.parser.getNewsItems();
            await this.logger.appendLog("Found " + newsJSONList.length + " news items");

            let currentHash = new WorkflowResultHash(HashHelper.hashFromObject(newsJSONList));

            let previousMealOffersHash = await this.getPreviousHash();
            if(WorkflowResultHash.isError(previousMealOffersHash)){
                console.log("Previous Hash is Error");
                await this.logger.appendLog("Error: " + previousMealOffersHash.toString());
                return this.logger.getFinalLogWithStateAndParams({
                    state: WORKFLOW_RUN_STATE.FAILED,
                });
            }

            let noHash = !previousMealOffersHash;
            let isSameHash = currentHash.isSame(previousMealOffersHash);
            if(noHash || !isSameHash){
                await this.updateNews(newsJSONList);
            }

            await this.logger.appendLog("Finished");
            return await this.logger.getFinalLogWithStateAndParams({
                state: WORKFLOW_RUN_STATE.SUCCESS,
                result_hash: currentHash.getHash()
            });
        } catch (err: any) {
            await this.logger.appendLog("Error: " + err.toString());
        }
        return await this.logger.getFinalLogWithStateAndParams({
            state: WORKFLOW_RUN_STATE.FAILED,
        });
    }

    async findOrCreateSingleNews(newsJSON: NewsTypeForParser) {
        let itemService = await this.myDatabaseHelper.getNewsHelper();

        const searchJson = {
            external_identifier: newsJSON?.basicNews.external_identifier
        };

        return await itemService.findOrCreateItem(searchJson, searchJson);
    }

    async updateNewsTranslations(item: News, newsJSON: NewsTypeForParser) {
        await TranslationHelper.updateItemTranslations(item, newsJSON.translations, "news_id", CollectionNames.NEWS, this.myDatabaseHelper);
    }

    async updateOtherFields(item: News, newsJSON: NewsTypeForParser) {
        let itemService = this.myDatabaseHelper.getNewsHelper();
        await itemService.updateOne(item?.id, newsJSON.basicNews);
    }

    async updateNews(newsJSONList: NewsTypeForParser[]) {
        for (let newsJSON of newsJSONList) {
            let news = await this.findOrCreateSingleNews(newsJSON);
            if (!!news && news?.id) {
                await this.updateOtherFields(news, newsJSON);
                await this.updateNewsTranslations(news, newsJSON);
            }
        }
    }

}
