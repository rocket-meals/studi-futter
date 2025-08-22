// small jest test
import { describe, it } from '@jest/globals';
import { DatabaseTypes } from 'repo-depkit-common';
import { DateHelper } from 'repo-depkit-common';
import { ReportSchedule } from '../ReportSchedule';
import { FoodofferDateType } from '../../food-sync-hook/FoodParserInterface';

describe('TestFoodFeedbackReportScheduleGetReferenceDate Test', () => {
  it('ReferenceDate on same Date', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: true,
      send_report_at_hh_mm: sendReportAtHhMmPadded,
      period_days_offset: 0,
      period_days_amount: 7,
      send_on_mondays: true,
      send_on_tuesdays: true,
      send_on_wednesdays: true,
      send_on_thursdays: true,
      send_on_fridays: true,
      send_on_saturdays: true,
      send_on_sundays: true,
    };

    const now_simulated = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 1,
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const expectedGenerateForDate = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 1,
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });
    const expectedGenerateForDateOnly: FoodofferDateType = DateHelper.getFoodofferDateTypeFromDate(expectedGenerateForDate);

    // we simulate as if the report is due now
    const generateForDate = ReportSchedule.getReferenceDate(recipientEntry, now_simulated);
    expect(generateForDate).not.toBeNull();
    if (generateForDate === null) {
      return;
    }

    const generateForDateOnly: FoodofferDateType = DateHelper.getFoodofferDateTypeFromDate(generateForDate);

    expect(generateForDateOnly).toEqual(expectedGenerateForDateOnly);
  });

  it('ReferenceDate for an offset', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let startDay = 1; // 1st of July is a Monday
    let offset = 3; // 3 days offset
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: true,
      send_report_at_hh_mm: sendReportAtHhMmPadded,
      period_days_offset: offset,
      period_days_amount: 7,
      send_on_mondays: true,
      send_on_tuesdays: true,
      send_on_wednesdays: true,
      send_on_thursdays: true,
      send_on_fridays: true,
      send_on_saturdays: true,
      send_on_sundays: true,
    };

    const now_simulated = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: startDay,
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const expectedGenerateForDate = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: startDay + offset,
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });
    const expectedGenerateForDateOnly: FoodofferDateType = DateHelper.getFoodofferDateTypeFromDate(expectedGenerateForDate);
    //console.log("expectedGenerateForDateOnly", expectedGenerateForDateOnly);

    // we simulate as if the report is due now
    const generateForDate = ReportSchedule.getReferenceDate(recipientEntry, now_simulated);
    expect(generateForDate).not.toBeNull();
    if (generateForDate === null) {
      return;
    }

    const generateForDateOnly: FoodofferDateType = DateHelper.getFoodofferDateTypeFromDate(generateForDate);
    //console.log("generateForDateOnly", generateForDateOnly);

    expect(generateForDateOnly).toEqual(expectedGenerateForDateOnly);
  });

  it('StartDate based on ReferenceDate same day', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: true,
      send_report_at_hh_mm: sendReportAtHhMmPadded,
      period_days_offset: 0,
      period_days_amount: 1,
      send_on_mondays: true,
      send_on_tuesdays: true,
      send_on_wednesdays: true,
      send_on_thursdays: true,
      send_on_fridays: true,
      send_on_saturdays: true,
      send_on_sundays: true,
    };

    const referenceDate = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 5,
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });

    let expectedStartDate = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 5,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const expectedStartDateOnly: FoodofferDateType = DateHelper.getFoodofferDateTypeFromDate(expectedStartDate);

    const startDate = ReportSchedule.getStartDateBasedOnReferenceDate(referenceDate, recipientEntry);
    const startDateOnly: FoodofferDateType = DateHelper.getFoodofferDateTypeFromDate(startDate);

    expect(expectedStartDateOnly).toEqual(startDateOnly);
  });

  it('StartDate based on ReferenceDate previous day', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: true,
      send_report_at_hh_mm: sendReportAtHhMmPadded,
      period_days_offset: 0,
      period_days_amount: 2,
      send_on_mondays: true,
      send_on_tuesdays: true,
      send_on_wednesdays: true,
      send_on_thursdays: true,
      send_on_fridays: true,
      send_on_saturdays: true,
      send_on_sundays: true,
    };

    const referenceDate = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 5,
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });

    let expectedStartDate = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 4,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const expectedStartDateOnly: FoodofferDateType = DateHelper.getFoodofferDateTypeFromDate(expectedStartDate);

    const startDate = ReportSchedule.getStartDateBasedOnReferenceDate(referenceDate, recipientEntry);
    const startDateOnly: FoodofferDateType = DateHelper.getFoodofferDateTypeFromDate(startDate);

    expect(expectedStartDateOnly).toEqual(startDateOnly);
  });

  it('ReferenceDate null if report not enabled', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: false,
      send_report_at_hh_mm: sendReportAtHhMmPadded,
      period_days_offset: 0,
      period_days_amount: 2,
      send_on_mondays: true,
      send_on_tuesdays: true,
      send_on_wednesdays: true,
      send_on_thursdays: true,
      send_on_fridays: true,
      send_on_saturdays: true,
      send_on_sundays: true,
    };

    const now_simulated = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 5,
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });

    const generateForDate = ReportSchedule.getReferenceDate(recipientEntry, now_simulated);

    expect(generateForDate).toBeNull();
  });
});
