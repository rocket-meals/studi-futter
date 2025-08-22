import { defineHook } from '@directus/extensions-sdk';
import { EventHelper } from '../helpers/EventHelper';
import { AvatarHelper } from '../helpers/AvatarHelper';
import { DatabaseInitializedCheck } from '../helpers/DatabaseInitializedCheck';

const SCHEDULE_NAME = 'users_avatar_delete';

export default defineHook(async ({ filter }, apiContext) => {
  let allTablesExist = await DatabaseInitializedCheck.checkAllTablesExistWithApiContext(SCHEDULE_NAME, apiContext);
  if (!allTablesExist) {
    return;
  }

  const { services, database, getSchema, env, logger } = apiContext;

  filter(
    EventHelper.USERS_DELETE_EVENT,
    // @ts-ignore
    async (payload: any, input, { database, schema, accountability }) => {
      const usersIds = payload; //get the user ids
      for (const userId of usersIds) {
        // for all users which get deleted
        await AvatarHelper.deleteAvatarOfUser(services, database, schema, accountability, userId); //delete avatar file
      }

      return payload;
    }
  );
});
