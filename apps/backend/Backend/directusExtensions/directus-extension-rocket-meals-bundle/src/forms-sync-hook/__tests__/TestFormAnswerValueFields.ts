import { CollectionHelper } from 'repo-depkit-common-backend';

import { CollectionNames } from 'repo-depkit-common';
import { FIELD_VALUE_KEY_PREFIX, FormAnswersValueFieldKeys } from '../FormImportTypes';

describe('Form Answer Value Fields Test', () => {
  it('All value_ keys from KeyOfFormAnswersValueFieldsType should be present in FormAnswersValueFieldKeys (compile-time check)', () => {
    let collectionPropertiesNames = CollectionHelper.getCollectionPropertyNames(CollectionNames.FORM_ANSWERS);
    let filteredCollectionPropertiesNames = collectionPropertiesNames.filter(name => name.startsWith(FIELD_VALUE_KEY_PREFIX));
    // check if FormAnswersValueFieldKeys contains exactly the same keys as filteredCollectionPropertiesNames
    let dictImplementedAnswerValueFields: Record<string, string> = {};
    let dictDatabaseAnswerValueFields: Record<string, string> = {};
    for (let key in FormAnswersValueFieldKeys) {
      dictImplementedAnswerValueFields[key] = key;
    }
    for (let key of filteredCollectionPropertiesNames) {
      dictDatabaseAnswerValueFields[key] = key;
    }
    // iterate over all keys, so that we can see which keys are missing or too much and tell the developer exactly what the problem is
    // expect all keys from the database to be present in the implemented keys
    for (let key in dictDatabaseAnswerValueFields) {
      try {
        expect(dictImplementedAnswerValueFields[key]).toBeDefined();
      } catch (e: any) {
        console.log(`Key "${key}" is present in database but not in implemented keys`);
        throw e;
      }
    }
    // expect all keys from the implemented keys to be present in the database keys
    for (let key in dictImplementedAnswerValueFields) {
      try {
        expect(dictDatabaseAnswerValueFields[key]).toBeDefined();
      } catch (e: any) {
        console.log(`Key "${key}" is present in implemented keys but not in database`);
        throw e;
      }
    }
  });
});
