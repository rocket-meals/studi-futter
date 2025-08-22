import { DatabaseTypes } from 'repo-depkit-common';
import { TranslationsFromParsingType } from '../helpers/TranslationHelper';
import { MarkingsTypeForParser } from './MarkingParserInterface';

export type FoodParseFoodAttributeValueType = {
  external_identifier: string;
  attribute_value: Omit<DatabaseTypes.FoodsAttributesValues, 'id' | 'food_attribute' | 'food_id' | 'foodoffer_id'>;
};
export type FoodParseFoodAttributesType = FoodParseFoodAttributeValueType[];

// Remove all fields with relation to other tables
export type FoodWithBasicData = Omit<DatabaseTypes.Foods, 'user_created' | 'user_updated' | 'markings' | 'image' | 'feedbacks' | 'translations' | 'environmental_impact' | 'nutrition' | 'rating_legacy_settings' | 'rating_settings' | 'food_category' | 'category' | 'attribute_values'>;
export type FoodWithBasicDataWithoutIdType = Omit<FoodWithBasicData, 'id'>;

export type FoodsInformationTypeForParser = {
  basicFoodData: FoodWithBasicData;
  attribute_values: FoodParseFoodAttributesType;
  category_external_identifier: string | null;
  marking_external_identifiers: string[];
  translations: TranslationsFromParsingType;
};

// Remove all fields with relation to other tables
type CanteenTypeOmitedFields = Omit<DatabaseTypes.Canteens, 'id' | 'user_created' | 'user_updated' | 'building' | 'foodservice_hours' | 'foodservice_hours_during_semester_break' | 'utilization_group'>;
export type CanteensTypeForParser = CanteenTypeOmitedFields & {
  external_identifier: string;
}; // make external_identifier required

export type FoodofferDateType = {
  year: number; // e.g. 2021
  month: number; // 01-12
  day: number; // 01-31
};
export type FoodofferTypeWithBasicData = Omit<DatabaseTypes.Foodoffers, 'id' | 'user_created' | 'user_updated' | 'canteen' | 'food' | 'markings' | 'date' | 'environmental_impact' | 'nutrition' | 'prices' | 'foodoffer_category' | 'category' | 'attribute_values'>;
export type FoodoffersTypeForParser = {
  basicFoodofferData: FoodofferTypeWithBasicData;
  attribute_values: FoodParseFoodAttributesType;
  marking_external_identifiers: string[];
  category_external_identifier: string | null;
  date: FoodofferDateType;
  canteen_external_identifier: string;
  food_id: string;
};

export type FoodofferTypeForCreation = FoodofferTypeWithBasicData & {
  date: string | null; // in the format "YYYY-MM-DD" e.g. "2021-01-01" where month 01 is January
  canteen: string; // we require the primary key of the canteen
  food: string; // we require the primary key of the food
};

export interface FoodParserInterface {
  /**
   * This method should create the needed data for the parser to work on every call of the parser.
   */
  createNeededData(markingsJSONList?: MarkingsTypeForParser[] | undefined): Promise<void>;

  /**
   * This method should return the list of all canteens
   */
  getCanteensList(): Promise<CanteensTypeForParser[]>;

  /**
   * This method should return the list of all foods
   */
  getFoodsListForParser(): Promise<FoodsInformationTypeForParser[]>;

  /**
   * This method should return the list of all foodoffers
   */
  getFoodoffersForParser(): Promise<FoodoffersTypeForParser[]>;

  /**
   * Should create new markings when they do not exist yet
   */
  shouldCreateNewMarkingsWhenTheyDoNotExistYet(): boolean;
}
