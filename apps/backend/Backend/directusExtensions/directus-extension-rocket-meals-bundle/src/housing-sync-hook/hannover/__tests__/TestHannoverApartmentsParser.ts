// small jest test
import { describe, expect, it, jest } from '@jest/globals';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { StudentenwerkHannoverApartments_Parser } from '../StudentenwerkHannoverApartments_Parser';

const html = fs.readFileSync(path.resolve(__dirname, './Apartments.html'), 'utf8');

describe('Hannover Apartments Parser', () => {
  let parser = new StudentenwerkHannoverApartments_Parser();

  it('Get Apartments', async () => {
    jest.spyOn(axios, 'get').mockImplementation(url => {
      if (url === StudentenwerkHannoverApartments_Parser.apartmentsUrl) {
        return Promise.resolve({ data: html });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    let items = await parser.getApartmentList();
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBe(20);

    const searchApartmentExternalIdentifier = 'apartment_Bischofsholer_Damm';
    const foundApartment = items.find(item => item.basicData.external_identifier === searchApartmentExternalIdentifier);
    expect(foundApartment).toBeDefined();
    expect(foundApartment?.buildingData.alias).toBe('Bischofsholer Damm');
    expect(foundApartment?.buildingData.url).toBe('https://www.studentenwerk-hannover.de/wohnen/wohnhaeuser/detailansicht/Bischofsholer%20Damm');
    expect(foundApartment?.buildingData.image_remote_url).toBe('https://www.studentenwerk-hannover.de/fileadmin/user_upload/Bilder/2_Wohnen/WH_BiDa_Herzog.jpg');
  });
});
