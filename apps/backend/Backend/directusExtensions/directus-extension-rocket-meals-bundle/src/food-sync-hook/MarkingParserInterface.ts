import { DatabaseTypes } from 'repo-depkit-common';
import { TranslationsFromParsingType } from '../helpers/TranslationHelper';

type MarkingTypeOmitedFields = Omit<DatabaseTypes.Markings, 'id' | 'user_created' | 'user_updated' | 'translations'>;
export type MarkingsTypeForParser = MarkingTypeOmitedFields & {
  external_identifier: string;
  translations: TranslationsFromParsingType;
};

export interface MarkingParserInterface {
  createNeededData(): Promise<void>;

  getMarkingsJSONList(): Promise<MarkingsTypeForParser[]>;
}
