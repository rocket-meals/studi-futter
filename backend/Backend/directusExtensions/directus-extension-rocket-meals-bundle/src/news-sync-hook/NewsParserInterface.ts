import {News, WorkflowsRuns} from "../databaseTypes/types";
import {TranslationsFromParsingType} from "../helpers/TranslationHelper";
import {WorkflowRunLogger} from "../workflows-runs-hook/WorkflowRunJobInterface";

type NewsTypeForParserOmmited = Omit<News, 'id' | 'user_created' | 'user_updated' | 'image' | "translations" |"status" | "external_identifier"> & {
    external_identifier: string
}
export type NewsTypeForParser = {
    basicNews: NewsTypeForParserOmmited,
    translations: TranslationsFromParsingType
}

export interface NewsParserInterface {

    getNewsItems(workflowRun?: WorkflowsRuns, logger?: WorkflowRunLogger): Promise<NewsTypeForParser[]>;
}
