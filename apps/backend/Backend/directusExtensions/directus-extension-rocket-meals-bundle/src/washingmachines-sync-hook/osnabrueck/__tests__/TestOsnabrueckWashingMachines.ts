// small jest test
import { describe, expect, it, jest } from '@jest/globals';
import { StudentenwerkOsnabrueckWashingmachineParser } from '../StudentenwerkOsnabrueckWashingmachineParser';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { DateHelper } from 'repo-depkit-common';

const xml = fs.readFileSync(path.resolve(__dirname, './getAllTerminals.xml'), 'utf8');
const html = fs.readFileSync(path.resolve(__dirname, './getAllTerminalsWeb.html'), 'utf8');

describe('Osnabrueck Washer Test', () => {
  let osnabrueckWasherParser = new StudentenwerkOsnabrueckWashingmachineParser();

  async function getWashingmachines(simulated_now?: Date) {
    jest.spyOn(axios, 'get').mockImplementation(url => {
      if (url === StudentenwerkOsnabrueckWashingmachineParser.getAllTerminalsUrl) {
        return Promise.resolve({ data: html });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    let washers = await osnabrueckWasherParser.getWashingmachines(simulated_now);
    return washers;
  }

  it('Find all washing machines', async () => {
    let simulated_now = new Date();
    let washers = await getWashingmachines(simulated_now);
    expect(washers.length).toBeGreaterThan(0);
    expect(washers.length).toBe(38);
  });

  it('Find no duplicates', async () => {
    let dictExternalIdentifier = new Map<string, boolean>();
    let simulated_now = new Date();
    let washers = await getWashingmachines(simulated_now);

    for (let i = 0; i < washers.length; i++) {
      let washer = washers[i];
      expect(washer).toBeDefined();
      if (!!washer) {
        let external_identifier = washer.basicData.external_identifier;
        expect(dictExternalIdentifier.get(external_identifier)).toBeUndefined();
        dictExternalIdentifier.set(external_identifier, true);
      }
    }
  });

  it('Check time free correct', async () => {
    let simulated_now = new Date();
    let washers = await getWashingmachines(simulated_now);

    const runningWasherExternalIdentifier = StudentenwerkOsnabrueckWashingmachineParser.getWasherExternalIdentifier(151, 4);
    const runningWasher = washers.find(w => w.basicData.external_identifier === runningWasherExternalIdentifier);
    expect(runningWasher).toBeDefined();
    expect(runningWasher?.basicData.date_finished).not.toBeNull();
    const dateFinished = new Date(runningWasher?.basicData.date_finished as string);
    // date_finished should be 153 minutes in the future or atleast in the future
    const nowWithoutTimezone = new Date(DateHelper.formatDateToIso8601WithoutTimezone(new Date()));
    expect(dateFinished.getTime()).toBeGreaterThan(nowWithoutTimezone.getTime());

    /**
     * <list>
     *                     <automatenNR>4</automatenNR>
     *                     <expectedFreeTime>153</expectedFreeTime>
     *                     <stateRunning>true</stateRunning>
     *                     <terminalN5>151</terminalN5>
     *                 </list>
     */

    // washingmachine 151 4 should be running and finished in 153 minutes

    let expectedDateFinished = new Date(simulated_now);
    expectedDateFinished.setMinutes(expectedDateFinished.getMinutes() + 153);
    let expectedDateFinishedString = DateHelper.formatDateToIso8601WithoutTimezone(expectedDateFinished);
    expect(runningWasher?.basicData.date_finished).toBe(expectedDateFinishedString);
    //console.log("Expected date finished: " + expectedDateFinishedString);
  });

  it('Washingmachine with state running but no minutes free is finished', async () => {
    let simulated_now = new Date();
    let washers = await getWashingmachines(simulated_now);

    const runningWasherExternalIdentifier = StudentenwerkOsnabrueckWashingmachineParser.getWasherExternalIdentifier(150, 2);
    const runningWasher = washers.find(w => w.basicData.external_identifier === runningWasherExternalIdentifier);
    expect(runningWasher).toBeDefined();
    expect(runningWasher?.basicData.date_finished).toBeNull();
  });
});
