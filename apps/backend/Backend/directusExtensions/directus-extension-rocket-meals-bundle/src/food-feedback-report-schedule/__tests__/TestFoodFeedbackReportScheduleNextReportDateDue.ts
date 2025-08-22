// small jest test
import { describe, it } from '@jest/globals';
import { DatabaseTypes } from 'repo-depkit-common';
import { DateHelper } from 'repo-depkit-common';
import { ReportSchedule } from '../ReportSchedule';

describe('TestFoodFeedbackReportScheduleNextReportDateDue Test', () => {
  it('Generation due for the same day', async () => {
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
      day: 1, // 1.7.2024 is a Monday
      hours: 5, // since we are before the sendReportAtHour, we expect the report to be due today
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const expectedNextReportDue = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 1,
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });
    const expectedNextReportDueString = expectedNextReportDue.toISOString();

    const nextReportDue = ReportSchedule.getNextReportIsDueToBeGeneratedDateOrNull(recipientEntry, now_simulated);
    expect(nextReportDue).not.toBeNull();
    if (nextReportDue) {
      const nextReportDueString = nextReportDue.toISOString();
      expect(nextReportDueString).toBe(expectedNextReportDueString);
    }
  });

  it('Generation due for the same day, although send amount days before offer date is not 0', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: true,
      send_report_at_hh_mm: sendReportAtHhMmPadded,
      period_days_offset: 3, // although this is not 0, we expect the report to be due today
      period_days_amount: 7,
      // We want to send the report 3 days before the offer date. The offer date is today (Monday) plus 3 days is Thursday.
      send_on_mondays: true,
      send_on_tuesdays: true,
      send_on_wednesdays: true,
      send_on_thursdays: true, // As the offer date is Thursday and enabled, we expect the report to be due today
      send_on_fridays: true,
      send_on_saturdays: true,
      send_on_sundays: true,
    };

    const now_simulated = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 1, // 1.7.2024 is a Monday
      hours: 5, // since we are before the sendReportAtHour, we expect the report to be due today
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const expectedNextReportDue = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 1,
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });
    const expectedNextReportDueString = expectedNextReportDue.toISOString();

    const nextReportDue = ReportSchedule.getNextReportIsDueToBeGeneratedDateOrNull(recipientEntry, now_simulated);
    expect(nextReportDue).not.toBeNull();
    if (nextReportDue) {
      const nextReportDueString = nextReportDue.toISOString();
      expect(nextReportDueString).toBe(expectedNextReportDueString);
    }
  });

  it('Generation due for the next day, since it is after the sendReportAtHour', async () => {
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
      day: 1, // 1.7.2024 is a Monday
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const expectedNextReportDue = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 2, // we expect the next report to be due on the next day
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });
    const expectedNextReportDueString = expectedNextReportDue.toISOString();

    const nextReportDue = ReportSchedule.getNextReportIsDueToBeGeneratedDateOrNull(recipientEntry, now_simulated);
    expect(nextReportDue).not.toBeNull();
    if (nextReportDue) {
      const nextReportDueString = nextReportDue.toISOString();
      expect(nextReportDueString).toBe(expectedNextReportDueString);
    }
  });

  it('Generation due for Friday, since all other days are disabled', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: true,
      send_report_at_hh_mm: sendReportAtHhMmPadded,
      period_days_offset: 0,
      period_days_amount: 7,
      send_on_mondays: false,
      send_on_tuesdays: false,
      send_on_wednesdays: false,
      send_on_thursdays: false,
      send_on_fridays: true, // only Friday is enabled
      send_on_saturdays: false,
      send_on_sundays: false,
    };

    const now_simulated = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 1, // 1.7.2024 is a Monday
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const expectedNextReportDue = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 5, // we expect the next report to be due on Friday
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });
    const expectedNextReportDueString = expectedNextReportDue.toISOString();

    const nextReportDue = ReportSchedule.getNextReportIsDueToBeGeneratedDateOrNull(recipientEntry, now_simulated);
    expect(nextReportDue).not.toBeNull();
    if (nextReportDue) {
      const nextReportDueString = nextReportDue.toISOString();
      expect(nextReportDueString).toBe(expectedNextReportDueString);
    }
  });

  it('Generation due for in 2 days, since it is after the sendReportAtHour and next day is disabled', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: true,
      send_report_at_hh_mm: sendReportAtHhMmPadded,
      period_days_offset: 4, // we want to send the report 4 days before the offer date
      period_days_amount: 7,
      // So the offer date is Monday, plus 4 days is Friday. But Friday is not enabled, so we cant generate the report for Friday
      send_on_mondays: true,
      send_on_tuesdays: false,
      send_on_wednesdays: true,
      send_on_thursdays: true,
      send_on_fridays: true, // Friday is not enabled
      send_on_saturdays: true, // but Saturday is enabled
      send_on_sundays: true,
    };

    const now_simulated = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 1, // 1.7.2024 is a Monday
      hours: sendReportAtHour + 1, // after the sendReportAtHour
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });

    const expectedNextReportDue = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 3, // we expect the next report to be due on the next day.
      // normally we would send the report 4 days before the offer date, but Friday is not enabled.
      // So we can generate the report for Saturday. And 4 days before Saturday is Tuesday.
      hours: sendReportAtHour,
      minutes: sendReportAtMinute,
      seconds: 0,
      milliseconds: 0,
    });
    const expectedNextReportDueString = expectedNextReportDue.toISOString();

    const nextReportDue = ReportSchedule.getNextReportIsDueToBeGeneratedDateOrNull(recipientEntry, now_simulated);
    expect(nextReportDue).not.toBeNull();
    if (nextReportDue) {
      const nextReportDueString = nextReportDue.toISOString();
      expect(nextReportDueString).toBe(expectedNextReportDueString);
    }
  });

  it('No days are enabled, no report date can be found', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: true,
      send_report_at_hh_mm: sendReportAtHhMmPadded,
      period_days_offset: 0,
      period_days_amount: 7,
      send_on_mondays: false,
      send_on_tuesdays: false,
      send_on_wednesdays: false,
      send_on_thursdays: false,
      send_on_fridays: false,
      send_on_saturdays: false,
      send_on_sundays: false,
    };

    const now_simulated = DateHelper.getDate({
      year: 2024,
      month: 7,
      day: 1, // 1.7.2024 is a Monday
      hours: 5, // before the sendReportAtHour
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const nextReportDue = ReportSchedule.getNextReportIsDueToBeGeneratedDateOrNull(recipientEntry, now_simulated);
    expect(nextReportDue).toBeNull();
  });

  it('No next due date if disabled', async () => {
    const sendReportAtHour = 6;
    const sendReportAtMinute = 0;
    const sendReportAtHhMmPadded = `${sendReportAtHour.toString().padStart(2, '0')}:${sendReportAtMinute.toString().padStart(2, '0')}`;
    let recipientEntry: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      enabled: false,
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
      day: 1, // 1.7.2024 is a Monday
      hours: 5, // before the sendReportAtHour
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const nextReportDue = ReportSchedule.getNextReportIsDueToBeGeneratedDateOrNull(recipientEntry, now_simulated);
    expect(nextReportDue).toBeNull();
  });
});
