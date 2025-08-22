/**
 * ┌────────────── second (0-59)
 *  │ ┌──────────── minute (0-59)
 *  │ │ ┌────────── hour (0-23)
 *  │ │ │ ┌──────── day of month (1-31)
 *  │ │ │ │ ┌────── month (1-12)
 *  │ │ │ │ │ ┌──── day of week (0-7)
 *  │ │ │ │ │ │
 *  │ │ │ │ │ │
 *  * * * * * *
 */

type CronObject = {
  second: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};

export class CronHelper {
  public static createCronString(cronObject: CronObject): string {
    return `${cronObject.second} ${cronObject.minute} ${cronObject.hour} ${cronObject.dayOfMonth} ${cronObject.month} ${cronObject.dayOfWeek}`;
  }

  public static EVERY_MINUTE: string = CronHelper.createCronString({
    second: '0',
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  });

  public static EVERY_TEN_SECONDS: string = CronHelper.createCronString({
    second: '*/10',
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  });
}
