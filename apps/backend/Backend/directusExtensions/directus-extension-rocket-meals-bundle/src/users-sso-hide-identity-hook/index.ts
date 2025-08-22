import { defineHook } from '@directus/extensions-sdk';
import { EventHelper } from '../helpers/EventHelper';
import { DatabaseTypes } from 'repo-depkit-common';

function hasDifferentProviderThanDefault(partialUserInput: Partial<DatabaseTypes.DirectusUsers>) {
  const provider = partialUserInput.provider;
  if (!provider) {
    // normally no provider is passed on creation as it is the default value
    return false;
  } else {
    const isDefaultProvider = provider === '' || provider === 'default';
    return !isDefaultProvider;
  }
}

export default defineHook(async ({ action, filter }, apiContext) => {
  filter(EventHelper.USERS_CREATE_EVENT, async (input, meta, context) => {
    const partialUserInput = input as Partial<DatabaseTypes.DirectusUsers>;
    if (hasDifferentProviderThanDefault(partialUserInput)) {
      partialUserInput.first_name = null;
      partialUserInput.last_name = null;
      partialUserInput.email = null;
    }
    input = partialUserInput; // Rewrite back to input

    return input;
  });

  /**
	filter(EventHelper.USERS_LOGIN_EVENT, async (input, meta, context) => {
		console.log("Filter User login event")
		console.log(input);
		// {
		//   code: 'XXXXXXXX',
		//   codeVerifier: 'XXXXXXXX',
		//   state: 'XXXXX',
		//   iss: undefined
		// }
		// or
		// {
		//   email: 'xxxxx@example.com',
		//   password: '123456XXXX',
		//   mode: 'session'
		// }
		const user = context.accountability?.user;
		console.log("User")
		console.log(user);

		return input;
	});
		*/
});
