// small jest test
import { describe, it } from '@jest/globals';
import { DatabaseTypes } from 'repo-depkit-common';
import { ReportSchedule } from '../ReportSchedule';

describe('TestFoodFeedbackReportScheduleHaveTimeSettingsChanged Test', () => {
  it('Payload has no time settings passed', async () => {
    const currentItem: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      send_report_at_hh_mm: '12:00',
    };
    const modifiable_payload: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {};

    // since no time settings are passed, it should return false
    expect(ReportSchedule.haveTimeSettingsChanged(currentItem, modifiable_payload)).toBe(false);
  });

  it('Payload has time settings passed', async () => {
    const currentItem: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      send_report_at_hh_mm: '12:00',
    };
    const modifiable_payload: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      send_report_at_hh_mm: '12:00',
    };

    // since time settings are passed, it should return false since they are the same
    expect(ReportSchedule.haveTimeSettingsChanged(currentItem, modifiable_payload)).toBe(false);
  });

  it('Payload has time settings passed, but they are different', async () => {
    const currentItem: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      send_report_at_hh_mm: '12:00',
    };
    const modifiable_payload: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      send_report_at_hh_mm: '13:00',
    };

    // since time settings are passed, it should return true since they are different
    expect(ReportSchedule.haveTimeSettingsChanged(currentItem, modifiable_payload)).toBe(true);
  });

  it('Payload has time settings passed, but currentItem has no time settings', async () => {
    const currentItem: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      send_report_at_hh_mm: null,
    };
    const modifiable_payload: Partial<DatabaseTypes.CanteenFoodFeedbackReportSchedules> = {
      send_report_at_hh_mm: '13:00',
    };

    // since currentItem has no time settings, it should return true since they are different
    expect(ReportSchedule.haveTimeSettingsChanged(currentItem, modifiable_payload)).toBe(true);
  });
});
