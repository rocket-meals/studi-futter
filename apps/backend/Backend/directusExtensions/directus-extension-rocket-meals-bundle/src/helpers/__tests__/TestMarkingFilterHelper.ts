// small jest test
import { describe, expect, it } from '@jest/globals';
import { DatabaseTypes } from 'repo-depkit-common';
import { MarkingFilterHelper, MarkingWithIdAndExclusionRulesOnly } from '../MarkingFilterHelper';

const marking_id_meat = 'meat_marking_id';
const marking_id_vegan = 'vegan_marking_id';
const marking_id_gluten = 'gluten_marking_id';
const marking_id_chicken = 'chicken_marking_id';
const marking_id_sugar = 'pork_sugar_id';

let marking_exclusion_current_id = 1;

const marking_exclusion_rule_vegan_is_restricted_by_chicken: DatabaseTypes.MarkingsExclusions = {
  id: marking_exclusion_current_id++,
  restricted_markings_id: marking_id_vegan,
  restricted_by_markings_id: marking_id_chicken,
};
const marking_exclusion_rule_vegan_is_restricted_by_meat: DatabaseTypes.MarkingsExclusions = {
  id: marking_exclusion_current_id++,
  restricted_markings_id: marking_id_vegan,
  restricted_by_markings_id: marking_id_meat,
};

const dictMarkingsExclusions = MarkingFilterHelper.getDictMarkingsExclusions([marking_exclusion_rule_vegan_is_restricted_by_chicken, marking_exclusion_rule_vegan_is_restricted_by_meat]);

const marking_meat: MarkingWithIdAndExclusionRulesOnly = {
  id: marking_id_meat,
  excluded_by_markings: [],
};
const marking_vegan: MarkingWithIdAndExclusionRulesOnly = {
  id: marking_id_vegan,
  excluded_by_markings: [marking_exclusion_rule_vegan_is_restricted_by_chicken, marking_exclusion_rule_vegan_is_restricted_by_meat],
};
const marking_gluten: MarkingWithIdAndExclusionRulesOnly = {
  id: marking_id_gluten,
  excluded_by_markings: [],
};
const marking_chicken: MarkingWithIdAndExclusionRulesOnly = {
  id: marking_id_chicken,
  excluded_by_markings: [],
};
const marking_sugar: MarkingWithIdAndExclusionRulesOnly = {
  id: marking_id_sugar,
  excluded_by_markings: [],
};

const markings_where_nothing_will_be_filtered_because_no_restrictions = [marking_vegan, marking_gluten, marking_sugar];
const markings_where_nothing_will_be_filtered_because_no_other_marking_which_restricts = [marking_meat, marking_chicken];
const markings_where_vegan_will_be_filtered = [marking_meat, marking_vegan, marking_gluten, marking_chicken, marking_sugar];

describe('MarkingFilterHelper Test', () => {
  it('Test filterMarkingByRestrictionRules where nothing will be filtered because no restrictions', () => {
    const filteredMarkings = MarkingFilterHelper.filterMarkingByRestrictionRules(markings_where_nothing_will_be_filtered_because_no_restrictions, dictMarkingsExclusions);
    expect(filteredMarkings).toEqual(markings_where_nothing_will_be_filtered_because_no_restrictions);
  });

  it('Test filterMarkingByRestrictionRules where nothing will be filtered because no other marking which restricts', () => {
    const filteredMarkings = MarkingFilterHelper.filterMarkingByRestrictionRules(markings_where_nothing_will_be_filtered_because_no_other_marking_which_restricts, dictMarkingsExclusions);
    expect(filteredMarkings).toEqual(markings_where_nothing_will_be_filtered_because_no_other_marking_which_restricts);
  });

  it('Test filterMarkingByRestrictionRules where vegan will be filtered', () => {
    const filteredMarkings = MarkingFilterHelper.filterMarkingByRestrictionRules(markings_where_vegan_will_be_filtered, dictMarkingsExclusions);
    expect(filteredMarkings).toEqual([marking_meat, marking_gluten, marking_chicken, marking_sugar]);
  });
});
