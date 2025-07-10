import { defineHook } from '@directus/extensions-sdk';
import {EventHelper} from '../helpers/EventHelper';
import {DatabaseInitializedCheck} from "../helpers/DatabaseInitializedCheck";
import {MyDatabaseHelper} from "../helpers/MyDatabaseHelper";
import {CollectionNames} from "repo-depkit-common";

const SCHEDULE_NAME = "profile_create";

export default defineHook(async ({ filter, schedule}, apiContext) => {
	let allTablesExist = await DatabaseInitializedCheck.checkAllTablesExistWithApiContext(SCHEDULE_NAME,apiContext);
	if (!allTablesExist) {
		return;
	}

	const myDatabaseHelper = new MyDatabaseHelper(apiContext);

	let users_service = myDatabaseHelper.getUsersHelper();
	let profiles_service = myDatabaseHelper.getProfilesHelper();

	// every minute
	schedule('0 * * * * *', async () => {
		// search for users without profiles and create profiles for them
		// users without profiles
		let users = await users_service.readByQuery({
			filter: {
				profile: {
					_null: true
				}
			},
			limit: -1
		});
		if(!!users && users.length > 0) {
			console.log("Users without profiles: " + users.length);
			for (let user of users) {
				try {
					let profile_id = await profiles_service.createOne({}); //create a profile
					if (profile_id && typeof profile_id === "string") {
						console.log("Created profile for user: " + user.id);
						await users_service.updateOne(user.id, {
							profile: profile_id
						});
					}
				} catch (e) {
					console.log(
						'profileCreateHook: Error while creating profile for user: ' +
						user.id
					);
					console.log(e);
				}
			}
		}
	});

	filter(
		EventHelper.USERS_LOGIN_EVENT,
		//     async (input: any, actionContext: any) => { /** action */
		async (input, meta, actionContext) => {
			/** filter */
			const {database} = actionContext;

			//const currentProvider = input.provider; //get the current provider
			//        let userId = input.user; // action
			let userId = meta.user; // filter
			const existingUsers = await database(CollectionNames.USERS).where({
				id: userId,
			});
			const existingUser = existingUsers[0];
			if (!existingUser) {
				//handle no user found error
				// @ts-ignore
				throw new Error(
					'profileCreateHook: No user found with id: ' + userId
				);
			}

			if (existingUser?.profile) {
				//user already has a profile
				return input;
			} else {
				//create a profile for the user
				try {
					console.log("Creating profile for user: " + userId)
					let profile_id = await profiles_service.createOne({}); //create a profile
					console.log("Created profile for user: " + userId)
					if (profile_id && typeof profile_id === "string") {
						console.log("New profile id: " + profile_id)
						await users_service.updateOne(userId, {
							profile: profile_id
						});
						return input;
					}
				} catch (e) {
					console.log(
						'profileCreateHook: Error while creating profile for user: ' +
						userId
					);
					console.log(e);
					return input;
				}
			}
			return input;
		}
	);
});
