import {FoodofferDateType} from "../food-sync-hook/FoodParserInterface";
import moment from "moment-timezone";

export enum Weekday {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}

export type MySimpleDate = {
    year: number,
    month: number,
    day: number,
    hours: number,
    minutes: number,
    seconds: number
    milliseconds: number
}

export enum DateHelperTimezone {
    GERMANY = "Europe/Berlin"
}

export class DateHelper {

    static getWeekdayList(): Weekday[] {
        return [
            Weekday.MONDAY,
            Weekday.TUESDAY,
            Weekday.WEDNESDAY,
            Weekday.THURSDAY,
            Weekday.FRIDAY,
            Weekday.SATURDAY,
            Weekday.SUNDAY
        ];
    }

    static getWeekdayListFromDate(date: Date): Weekday[] { // for example today is wednesday, so the list will be [WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY, MONDAY, TUESDAY]
        const weekdayList = DateHelper.getWeekdayList();
        const weekday = DateHelper.getWeekdayFromDate(date);
        const index = weekdayList.indexOf(weekday);
        const firstPart = weekdayList.slice(index);
        const secondPart = weekdayList.slice(0, index);
        return firstPart.concat(secondPart);
    }

    static getWeekdayFromDate(date: Date): Weekday {
        const weekday = date.getDay();
        switch (weekday) {
            case 0:
                return Weekday.SUNDAY;
            case 1:
                return Weekday.MONDAY;
            case 2:
                return Weekday.TUESDAY;
            case 3:
                return Weekday.WEDNESDAY;
            case 4:
                return Weekday.THURSDAY;
            case 5:
                return Weekday.FRIDAY;
            case 6:
                return Weekday.SATURDAY;
            default:
                throw new Error(`Invalid weekday: ${weekday}`);
        }
    }

    static getHumanReadableDate(date: Date, includeWeekdayName: boolean): string {
        const numericString = date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const weekdayName = date.toLocaleDateString('de-DE', {weekday: 'long'});
        let finalString = numericString;
        if (includeWeekdayName) {
            finalString += ` (${weekdayName})`;
        }
        return finalString;
    }

    static getHumanReadableTime(date: Date): string {
        return date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    static getHumanReadableDateAndTime(date: Date): string {
        return `${DateHelper.getHumanReadableDate(date, false)} ${DateHelper.getHumanReadableTime(date)}`;
    }

    static getFoodofferDateTypeFromDate(date: Date): FoodofferDateType {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        };
    }

    static foodofferDateTypeToString(date: FoodofferDateType){
        // 2024-08-14
        const year = date.year
        const month = String(date.month).padStart(2, '0');
        const day = String(date.day).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static parseDD_MM_YYYY(dateString: string): Date {
        const parts = dateString.split(".");
        if (parts.length !== 3) {
            throw new Error(`Invalid date string: ${dateString}`);
        }
        if(parts[0]==undefined || parts[1]==undefined || parts[2]==undefined){
            throw new Error(`Invalid date string: ${dateString}`);
        }
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        return new Date(year, month - 1, day);
    }

    static formatDDMMYYYYToDateWithTimeZone(value_raw: string, timezone: DateHelperTimezone){
        let date_with_timezone = moment.tz(value_raw, "DD.MM.YYYY", timezone);
        return date_with_timezone.toDate();
    }

    static formatDDMMYYYY_HHMMSSToDateWithTimeZone(value_raw: string, timezone: DateHelperTimezone){
        let date_with_timezone = moment.tz(value_raw, "DD.MM.YYYY HH:mm:ss", timezone);
        return date_with_timezone.toDate();
    }

    /**
     * Formats a date to ISO 8601 without timezone
     * @param date the date to format
     * @param clearSeconds if true, seconds will be set to 00
     */
    static formatDateToIso8601WithoutTimezone(date: Date, clearSeconds: boolean = true): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        let seconds = String(date.getSeconds()).padStart(2, '0');
        if (clearSeconds) {
            seconds = "00";
        }

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    static getDate(mySimpleDate: MySimpleDate): Date {
        return new Date(mySimpleDate.year, mySimpleDate.month-1, mySimpleDate.day, mySimpleDate.hours, mySimpleDate.minutes, mySimpleDate.seconds, mySimpleDate.milliseconds);
    }
}
