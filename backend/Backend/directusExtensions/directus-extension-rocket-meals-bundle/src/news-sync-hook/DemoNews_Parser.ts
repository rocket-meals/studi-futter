import {TranslationHelper} from "../helpers/TranslationHelper";
import {NewsParserInterface, NewsTypeForParser} from "./NewsParserInterface";
import {WorkflowsRuns} from "../databaseTypes/types";
import {WorkflowRunLogger} from "../workflows-runs-hook/WorkflowRunJobInterface";

export class DemoNews_Parser implements NewsParserInterface{

    constructor() {

    }

    async getNewsItems(workflowRun?: WorkflowsRuns, logger?: WorkflowRunLogger): Promise<NewsTypeForParser[]> {
        return [this.getDemoNewsItem("1"), this.getDemoNewsItem("2"), this.getDemoNewsItem("3")];
    }

    getDemoNewsItem(external_identifier: string): NewsTypeForParser {
        return {
            basicNews: {
                external_identifier: external_identifier,
                image_remote_url: "https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
                url: "https://www.pexels.com/de-de/foto/frau-die-im-flur-steht-wahrend-buch-halt-1462630/",
            },
            translations: {
                [TranslationHelper.LANGUAGE_CODE_DE]: {
                    title: "Test News "+external_identifier,
                    content: "Das ist ein Test News Artikel",
                    be_source_for_translations: true,
                    let_be_translated: false,
                }
            }
        }
    }

}
