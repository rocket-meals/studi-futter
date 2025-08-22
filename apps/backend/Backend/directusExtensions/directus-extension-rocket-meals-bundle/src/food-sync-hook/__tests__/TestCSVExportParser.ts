// small jest test
import { describe, it } from '@jest/globals';
import { CSVExportParser } from '../CSVExportParser';

const expectedParsedReportItem: { [key: string]: string } = {
  MENSA: 'Contine',
  VBORT_ID: '190',
  DATUM: '28.05.2024',
  'VK-ArtikelNr': '309328',
  'VK-GebindeNR': '291991',
  SPEISE: 'VEGGIE & VEGAN',
  SPEISE_BEZEICHNUNG: '',
  REZEPTUR_ID: '801454',
  TEXT1: 'Mini-Frühlingsrollen (k,20A,25)',
  TEXT2: 'Mango-Ingwer-Chutney (3,k)',
  TEXT3: 'Asiagemüse (20A,25)',
  TEXT4: 'Basmatireis with spaces at the end',
  TEXT5: '',
  TEXT6: '',
  TEXT1_1: 'mango-ginger chutney (3,k)',
  TEXT2_1: 'asian vegetables (20A,25)',
  TEXT3_1: 'basmati rice',
  TEXT4_1: '',
  TEXT5_1: '',
  TEXT6_1: '',
  PREIS_STUDENT: '3,00',
  PREIS_BEDIENSTETER: '6,30',
  PREIS_GAST: '7,90',
  PREIS_STUDENT_KARTE: '3,00',
  PREIS_BEDIENSTETER_KARTE: '6,30',
  PREIS_GAST_KARTE: '7,90',
  FREI1: '',
  FREI2: '',
  FREI3: '',
};

export function getTestRawReport(rawJsonObjectList: { [key: string]: string }[]): string {
  let result = '';

  let firstRawJsonObject = rawJsonObjectList[0];

  // Add header
  for (let key in firstRawJsonObject) {
    result += key + CSVExportParser.INLINE_DELIMITER_TAB;
  }
  result += CSVExportParser.NEW_LINE_DELIMITER;

  for (let rawJsonObject of rawJsonObjectList) {
    // Add data
    for (let key in rawJsonObject) {
      let value = rawJsonObject?.[key];
      if (value !== undefined) {
        result += value + CSVExportParser.INLINE_DELIMITER_TAB;
      }
    }
    result += CSVExportParser.NEW_LINE_DELIMITER;
  }

  return result;
}

describe('CSVExportParser Test', () => {
  let rawReport = getTestRawReport([expectedParsedReportItem]);

  it('should parse CSV report', () => {
    let parsedReport = CSVExportParser.getListOfLineObjectsWithParams(rawReport, CSVExportParser.NEW_LINE_DELIMITER, CSVExportParser.INLINE_DELIMITER_TAB, true);
    expect(parsedReport).toHaveLength(1);
  });

  it('should parse all headers', () => {
    let parsedReport = CSVExportParser.getListOfLineObjectsWithParams(rawReport, CSVExportParser.NEW_LINE_DELIMITER, CSVExportParser.INLINE_DELIMITER_TAB, true);
    let firstParsedReportItem = parsedReport[0];
    for (let key in expectedParsedReportItem) {
      expect(firstParsedReportItem).toHaveProperty(key);
    }
  });

  // TODO: Add more tests for CSVExportParser
  // Check tailoring quotes and spaces
  // Check if all values are parsed correctly
});
