import { TranslationHelper } from '../helpers/TranslationHelper';
import { MyDatabaseHelper } from '../helpers/MyDatabaseHelper';
import { DateHelper } from 'repo-depkit-common';
import { DatabaseTypes } from 'repo-depkit-common';
import { WorkflowRunLogger } from '../workflows-runs-hook/WorkflowRunJobInterface';
import { WORKFLOW_RUN_STATE } from '../helpers/itemServiceHelpers/WorkflowsRunEnum';

const SCHEDULE_NAME = 'FoodNotifySchedule';

export class NotifySchedule {
  private myDatabaseHelper: MyDatabaseHelper;
  private workflowRun: DatabaseTypes.WorkflowsRuns;
  private logger: WorkflowRunLogger;

  constructor(workflowRun: DatabaseTypes.WorkflowsRuns, myDatabaseHelper: MyDatabaseHelper, logger: WorkflowRunLogger) {
    this.myDatabaseHelper = myDatabaseHelper;
    this.workflowRun = workflowRun;
    this.logger = logger;
  }

  async notify(aboutMealsInDays = 1): Promise<Partial<DatabaseTypes.WorkflowsRuns>> {
    let devicesService = this.myDatabaseHelper.getDevicesHelper();

    await this.logger.appendLog('Start food notify schedule');
    await this.logger.appendLog('Notify about meals in ' + aboutMealsInDays + ' days');
    try {
      // We need to notify all devices, which want to get notified about new food offers which they are interested in

      // Step 1: Get all food offers at aboutMealsInDays days in the future
      //console.log("Get all food offers at aboutMealsInDays days in the future");
      let date = new Date();
      date.setDate(date.getDate() + aboutMealsInDays);
      await this.logger.appendLog('Date to notify about: ' + date.toISOString());
      let foodOffers = await this.getFoodOffersForDate(date);
      await this.logger.appendLog('Found ' + foodOffers.length + ' food offers for ' + date.toISOString());

      for (let foodOffer of foodOffers) {
        await this.logger.appendLog('- Notify about food offer: ' + foodOffer.id);
        let food_id = foodOffer.food as string;
        let foodWithTranslations = await this.getFoodWithTranslations(food_id);

        let food_offer_in_canteen_id = foodOffer.canteen;
        await this.logger.appendLog('- Food offer is in canteen: ' + food_offer_in_canteen_id);

        // Step 2: Get all food_feedbacks which want to get notified about this food
        let foodFeedbacks = await this.getFoodFeedbacksForFood(food_id);
        await this.logger.appendLog('- Found ' + foodFeedbacks.length + ' food feedbacks for food ' + food_id);

        for (let foodFeedback of foodFeedbacks) {
          let profile_id = foodFeedback.profile as string;
          await this.logger.appendLog('-- Notify profile: ' + profile_id + ' about food: ' + food_id);
          // Step 3: Get the profile and all devices of the profile
          let profile = await this.getProfileAndDevicesForProfile(profile_id);
          let language = profile.language as string;
          let profile_canteen_id = profile.canteen;

          // Step 3.1: Check if the profile is interested in the canteen
          if (profile_canteen_id !== food_offer_in_canteen_id) {
            //console.log("Profile is not interested in this canteen");
            continue;
          } else {
            //console.log("Profile is interested in this canteen");
            await this.logger.appendLog('-- Profile is interested in this canteen');
          }

          const profileDevices = profile.devices as DatabaseTypes.Devices[];

          let expoPushTokensDict = this.getExpoPushTokensToDevicesDict(profileDevices);

          let expoPushTokens = Object.keys(expoPushTokensDict);
          for (let expoPushToken of expoPushTokens) {
            let devices = expoPushTokensDict[expoPushToken] as DatabaseTypes.Devices[];
            //console.log("Notify devices: "+devices.length+" about food: "+food_id);
            await this.logger.appendLog('--- Notify devices: ' + devices.length + ' about food: ' + food_id);
            try {
              await this.notifyExpoPushTokenAboutFoodOffer(expoPushToken, foodOffer, foodWithTranslations, language, aboutMealsInDays, date);
            } catch (err: any) {
              //console.log("Error while creating push notification");
              //console.log(err);
              await this.logger.appendLog('--- Error while creating push notification: ' + err.toString());
              const message = err?.message;
              if (message.includes('Failed to send notification')) {
                //console.log("Failed to send notification");
                await this.logger.appendLog('--- Failed to send notification');
                //console.log("We better reset on the device the pushTokenObj to null");
                // Reset the pushTokenObj to null
                for (let device of devices) {
                  await devicesService.updateOne(device.id, {
                    pushTokenObj: null,
                  });
                }
              }
            }

            if (devices.length > 1) {
              await this.logger.appendLog('--- Notify multiple devices with the same push token');
              // we will remove the pushTokenObj from all but the last updated device
              await this.logger.appendLog('--- we will remove the pushTokenObj from all but the last updated device');
              let recentDateUpdated: Date | null = null;
              let recentDevice: DatabaseTypes.Devices | null = null;
              for (let device of devices) {
                if (!!device.date_updated) {
                  let device_date_updated = new Date(device.date_updated);
                  if (!recentDateUpdated || device_date_updated > recentDateUpdated) {
                    recentDateUpdated = device_date_updated;
                    recentDevice = device;
                  }
                }
              }
              // now we have the most recent device, so we will remove the pushTokenObj from all other devices
              for (let device of devices) {
                if (device.id !== recentDevice?.id) {
                  await this.logger.appendLog('--- Remove pushTokenObj from device.id: ' + device.id + ' as it is not the recent updated device: ' + device.id);
                  await devicesService.updateOne(device.id, {
                    pushTokenObj: null,
                  });
                }
              }
            }
          }

          for (let device of profileDevices) {
            await this.logger.appendLog('--- Notify device: ' + device.id + ' about food: ' + food_id);
            // Step 4: Send the notification to the device, where pushTokenObj is not null
            if (device.pushTokenObj !== null) {
              // Step 5: Send the notification to the device
              // TODO: Es kann mehrere Devices mit dem gleichen pushToken geben. Wir sollten nur einmal senden
            } else {
              //console.log("Device has no push token");
            }
          }
        }
      }
      //console.log("Finished");
      await this.logger.appendLog('Finished');
      return await this.logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.SUCCESS,
      });
    } catch (err: any) {
      await this.logger.appendLog('Error: ' + err.toString());
      return await this.logger.getFinalLogWithStateAndParams({
        state: WORKFLOW_RUN_STATE.FAILED,
      });
    }
  }

  getExpoPushTokenFromDevice(device: DatabaseTypes.Devices) {
    let pushTokenObj = device.pushTokenObj as any;
    return pushTokenObj?.pushtokenObj?.data;
  }

  getExpoPushTokensToDevicesDict(devices: DatabaseTypes.Devices[]): {
    [key: string]: DatabaseTypes.Devices[];
  } {
    let expoPushTokensDict: { [key: string]: DatabaseTypes.Devices[] } = {};
    for (let device of devices) {
      let expoPushToken = this.getExpoPushTokenFromDevice(device);
      if (expoPushToken) {
        let devicesWithSamePushToken = expoPushTokensDict[expoPushToken] || [];
        devicesWithSamePushToken.push(device);
        expoPushTokensDict[expoPushToken] = devicesWithSamePushToken;
      }
    }
    return expoPushTokensDict;
  }

  async notifyExpoPushTokenAboutFoodOffer(expoPushToken: string, foodOffer: DatabaseTypes.Foodoffers, foodWithTranslations: DatabaseTypes.Foods, language: string, aboutMealsInDays: number, date: Date) {
    // Create a new push_notification entry in the database
    let pushNotificationService = this.myDatabaseHelper.getPushNotificationsHelper();
    /**
         pushTokenObj = {
                "permission": {
                "status": "granted",
                    "canAskAgain": true,
                    "ios": {
                    "allowsSound": true,
                        "allowsCriticalAlerts": null,
                        "allowsAlert": true,
                        "allowsDisplayOnLockScreen": true,
                        "allowsDisplayInNotificationCenter": true,
                        "providesAppNotificationSettings": false,
                        "allowsDisplayInCarPlay": null,
                        "allowsAnnouncements": false,
                        "allowsBadge": true,
                        "alertStyle": 1,
                        "status": 2,
                        "allowsPreviews": 1
                },
                "expires": "never",
                    "granted": true
            },
                "pushtokenObj": {
                "type": "expo",
                    "data": "ExponentPushToken[FrpOmOBYzB8XP8SyvOgjOC]"
                }
            }
        */

    let project_name = await this.getProjectName();

    let foodName = this.getFoodNameTranslation(foodWithTranslations, language);
    let translationDate = await this.getTranslationDate(language, aboutMealsInDays, date);
    let emojiFood = '🍽';
    let useEmoji = true;
    let message_body = translationDate + ': ' + foodName;
    if (useEmoji) {
      message_body = emojiFood + ' ' + message_body;
    }

    let expo_push_tokens = [expoPushToken];
    let pushNotificationObj = {
      expo_push_tokens: expo_push_tokens,
      message_title: project_name,
      message_body: message_body,
    };

    let pushNotification = await pushNotificationService.createOne(pushNotificationObj);
  }

  async getTranslationDate(profileLanguage: string, aboutMealsInDays: number, date: Date) {
    if (aboutMealsInDays === 0) {
      return 'Heute';
    } else if (aboutMealsInDays === 1) {
      return 'Morgen';
    }

    return DateHelper.getHumanReadableDate(date, false);
  }

  getFoodNameTranslation(foodWithTranslations: DatabaseTypes.Foods, profileLanguage: string) {
    return TranslationHelper.getTranslation(foodWithTranslations?.translations, profileLanguage, 'name') || 'ein Gericht';
  }

  async getProjectName() {
    let serverInfo = await this.myDatabaseHelper.getServerInfo();
    let project = serverInfo?.project;
    let project_name = project?.project_name;
    return project_name || 'Rocket Meals';
  }

  async getFoodWithTranslations(food_id: string) {
    const foodsService = this.myDatabaseHelper.getFoodsHelper();
    return await foodsService.readOne(food_id, {
      fields: ['*', 'translations.*'],
    });
  }

  async getProfileAndDevicesForProfile(profile_id: string) {
    let profileService = this.myDatabaseHelper.getProfilesHelper();
    return await profileService.readOne(profile_id, {
      fields: ['*', 'devices.*'],
    });
  }

  async getFoodFeedbacksForFood(food_id: string) {
    const itemsService = this.myDatabaseHelper.getFoodFeedbacksHelper();
    let foodFeedbacks = await itemsService.readByQuery({
      filter: {
        // filter where food_id is food AND notify is true
        _and: [
          {
            food: {
              _eq: food_id,
            },
          },
          {
            notify: {
              _eq: true,
            },
          },
        ],
      },
      limit: -1,
    });
    return foodFeedbacks;
  }

  async getFoodOffersForDate(date: Date) {
    const directusDateOnlyFormat = DateHelper.foodofferDateTypeToString(DateHelper.getFoodofferDateTypeFromDate(date));
    const itemService = this.myDatabaseHelper.getFoodoffersHelper();
    let foodOffers = await itemService.readByQuery({
      filter: {
        date: {
          _eq: directusDateOnlyFormat,
        },
      },
      limit: -1,
    });
    return foodOffers;
  }
}
