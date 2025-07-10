import {defineHook} from '@directus/extensions-sdk';
import {CollectionNames} from "repo-depkit-common";
import {DatabaseInitializedCheck} from "../helpers/DatabaseInitializedCheck";
import {FoodRatingCalculator} from "./FoodRatingCalculator";

const SCHEDULE_NAME = "food_feedback_rating_calculate";

export default defineHook(async ({action, filter}, apiContext) => {
	let allTablesExist = await DatabaseInitializedCheck.checkAllTablesExistWithApiContext(SCHEDULE_NAME,apiContext);
	if (!allTablesExist) {
		return;
	}

	const foodRatingCalculator = new FoodRatingCalculator(apiContext);

	const collection = CollectionNames.FOODS_FEEDBACKS

	action(
		collection + ".items.update",
		async (meta) => {
			// get the collection which was updated

			let food_feedbacks_ids = meta.keys;
			let food_ids = await foodRatingCalculator.getFoodIdsFromFoodFeedbackIds(food_feedbacks_ids);
			let ignore_food_feedback_ids: string[] = [] // we do not want to ignore any food_feedbacks since we just created them
			foodRatingCalculator.recalculateFoodIdsRatingsNonBlocking(food_ids, ignore_food_feedback_ids);
			// {
			//   event: 'foods_feedbacks.items.update',
			//   payload: { rating: 4 },
			//   keys: [ '73e6dd26-f570-428d-8f8c-0a452beb222e' ],
			//   collection: 'foods_feedbacks'
			// }

		}
	);

	action(
		collection + ".items.create",
		async (meta) => {
			let food_feedback_id = meta.key;
			let food_feedbacks_ids = [food_feedback_id];
			let food_ids = await foodRatingCalculator.getFoodIdsFromFoodFeedbackIds(food_feedbacks_ids);
			let ignore_food_feedback_ids: string[] = [] // we do not want to ignore any food_feedbacks since we just updated them
			foodRatingCalculator.recalculateFoodIdsRatingsNonBlocking(food_ids, ignore_food_feedback_ids);
			//{
			//  |   event: 'foods_feedbacks.items.create',
			//  payload: { rating: 4, food: '1090' },
			//  key: '54e58fc8-3a15-42ed-b27b-856adffdd20c',
			//  collection: 'foods_feedbacks'
			//}

		}
	);

	//action( // we cannot use action here, because we would only get the keys of the deleted food_feedbacks. From this we dont know the food_id. Therefore we need to use filter, but we do not block the deletion of the food_feedbacks
	filter(
		collection + ".items.delete",
		async (payloadModifiable,
			   // @ts-ignore
			   meta, context) => {

			let food_feedbacks_ids = payloadModifiable;

			// check if food_feedbacks_ids is an array and the object exists
			if(!food_feedbacks_ids || !Array.isArray(food_feedbacks_ids) || food_feedbacks_ids.length === 0){
				// do nothing
			} else {
				let food_ids = await foodRatingCalculator.getFoodIdsFromFoodFeedbackIds(food_feedbacks_ids);
				let ignore_food_feedback_ids: string[] = food_feedbacks_ids // ATTENTION: we want to ignore the deleted food_feedbacks.
				// Because we are filtering, the feedback is not deleted yet, resulting in a wrong rating calculation considering the to be deleted feedbacks
				// Therefore we want to ignore the deleted feedbacks
				foodRatingCalculator.recalculateFoodIdsRatingsNonBlocking(food_ids, ignore_food_feedback_ids);
			}
			return payloadModifiable;
		}
	);
});
