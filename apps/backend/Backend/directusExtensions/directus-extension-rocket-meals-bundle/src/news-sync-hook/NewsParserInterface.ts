import { DatabaseTypes } from 'repo-depkit-common';
import { TranslationsFromParsingType } from '../helpers/TranslationHelper';
import { WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';

type NewsTypeForParserOmmited = Omit<DatabaseTypes.News, 'id' | 'user_created' | 'user_updated' | 'image' | 'translations' | 'status' | 'external_identifier'> & {
  external_identifier: string;
};
export type NewsTypeForParser = {
  basicNews: NewsTypeForParserOmmited;
  translations: TranslationsFromParsingType;
};

export interface NewsParserInterface {
  getNewsItems(workflowRun?: DatabaseTypes.WorkflowsRuns, logger?: WorkflowRunLogger): Promise<NewsTypeForParser[]>;
}
