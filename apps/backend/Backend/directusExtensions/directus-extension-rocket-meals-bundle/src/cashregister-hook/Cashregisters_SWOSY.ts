import axios from 'axios';
import { CashregistersTransactionsForParser, CashregisterTransactionParserInterface } from './CashregisterTransactionParserInterface';
import { DateHelper } from 'repo-depkit-common';

const BUCHUNGSNUMMER = 'BUCHUNGSNUMMER';
const Datum = 'Datum';
const Name = 'Name';
const Menge = 'Menge';
const Verbrauchergruppe_ID = 'Verbrauchergruppe_ID';
const Kasse_ID = 'Kasse_ID';

interface Transaction {
  [key: string]: any;
  BUCHUNGSNUMMER: string;
  Datum: string;
  Name?: string;
  Menge?: number;
  Verbrauchergruppe_ID?: string;
  Kasse_ID: string;
}

export class Cashregisters_SWOSY implements CashregisterTransactionParserInterface {
  password: string = '';
  api_url: string = '';

  constructor(api_url: string, password: string) {
    this.api_url = api_url;
    this.password = password;
  }

  async getTransactionsList(): Promise<CashregistersTransactionsForParser[]> {
    const data = await this.getAsJSON(this.api_url, this.password);
    const transactions: CashregistersTransactionsForParser[] = [];
    if (data) {
      const transactionIds = Object.keys(data);
      for (let i = 0; i < transactionIds.length; i++) {
        const transactionId = transactionIds[i];
        if (transactionId) {
          const transaction = data[transactionId];
          if (transaction) {
            transactions.push({
              baseData: {
                quantity: transaction.Menge,
                name: transaction.Name,
                id: transaction.BUCHUNGSNUMMER,
                date: transaction.Datum,
              },
              cashregister_external_idenfifier: transaction.Kasse_ID,
            });
          }
        }
      }
    }
    return transactions;
  }

  async loadFromRemote(url: string, password: string): Promise<string> {
    const encodedToken = Buffer.from(password).toString('base64');

    const resArBuffer = await axios.request({
      method: 'GET',
      url: url,
      headers: { Authorization: 'Basic ' + encodedToken },
      responseType: 'arraybuffer',
    });

    const response = resArBuffer.data.toString('latin1');
    const text = Buffer.from(response, 'utf-8').toString();
    return text;
  }

  async getAsJSON(url: string, password: string): Promise<Record<string, Transaction>> {
    const text = await this.loadFromRemote(url, password);

    const lineSeparator = text.includes('\r') ? '\r' : '\n';

    const fileLines = text.split(lineSeparator);
    //console.log(fileLines.length);
    if (!fileLines) {
      return {};
    }

    const bezeichnungen: string[] = [];
    const data: Record<string, Transaction> = {};

    for (let lineNumber = 0; lineNumber < fileLines.length; lineNumber++) {
      let rawLine = fileLines[lineNumber];
      if (rawLine === undefined) {
        continue; // skip empty lines
      }

      const line = rawLine.trim();

      if (lineNumber === 0) {
        const bez = line.split('\t');
        for (const item of bez) {
          bezeichnungen.push(item);
        }
      } else {
        if (line === '') {
          continue;
        }

        const parsedPart: Partial<Transaction> = {};
        const parsedParts = line.split('\t');

        for (let index = 0; index < bezeichnungen.length; index++) {
          let value = parsedParts[index] || '';
          const bez = bezeichnungen[index];

          switch (bez) {
            case BUCHUNGSNUMMER:
              parsedPart.BUCHUNGSNUMMER = Cashregisters_SWOSY.transformBuchungsnummer(value);
              break;
            case Datum:
              let transformedDate = Cashregisters_SWOSY.transformDate(value);
              if (!!transformedDate) {
                parsedPart.Datum = transformedDate;
              }
              break;
            case Name:
              parsedPart.Name = value;
              break;
            case Menge:
              parsedPart.Menge = parseFloat(value);
              break;
            case Verbrauchergruppe_ID:
              parsedPart.Verbrauchergruppe_ID = value;
              break;
            case Kasse_ID:
              parsedPart.Kasse_ID = value;
              break;
            default: // if the field is not known, we don't need it
              break;
          }
        }

        // check if parsedPart has all required fields of Transaction
        if (parsedPart.Datum && parsedPart.Kasse_ID && parsedPart.Menge && parsedPart.Name && parsedPart.Verbrauchergruppe_ID && parsedPart.BUCHUNGSNUMMER) {
          data[parsedPart.BUCHUNGSNUMMER] = {
            BUCHUNGSNUMMER: parsedPart.BUCHUNGSNUMMER,
            Datum: parsedPart.Datum,
            Kasse_ID: parsedPart.Kasse_ID,
            Menge: parsedPart.Menge,
            Name: parsedPart.Name,
            Verbrauchergruppe_ID: parsedPart.Verbrauchergruppe_ID,
          };
        }
      }
    }

    return data;
  }

  static transformDate(dateWithTime: string): string | null {
    const [date, time] = dateWithTime.split(' ');

    if (date === undefined || time === undefined) {
      return null;
    }

    const [day, month, year] = date.split('.').map(num => parseInt(num));
    if (day === undefined || month === undefined || year === undefined) {
      return null;
    }

    const [hour, minute, seconds] = time.split(':').map(num => parseInt(num));
    if (hour === undefined || minute === undefined || seconds === undefined) {
      return null;
    }

    function getLastSunday(year: number, month: number): Date {
      const lastDay = new Date(year, month + 1, 0);
      const dayOfWeek = lastDay.getDay();
      return new Date(year, month, lastDay.getDate() - dayOfWeek);
    }

    const dstStart = getLastSunday(year, 2);
    const dstEnd = getLastSunday(year, 9);

    const inputDate = new Date(year, month - 1, day, hour, minute, seconds);
    const isSummerTime = inputDate >= dstStart && inputDate < dstEnd;

    let adjustedHour = hour;
    //if(isSummerTime) { // we don't need to adjust the time as the date is without timezone
    //    adjustedHour = hour - 1;
    //}

    // expected: 2024-08-21T14:37:5
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${adjustedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  static transformBuchungsnummer(buchungsnummer: string): string | undefined {
    // buchungsnummer could be something like: "123456 789012       345678" -> "123456-789012-345678"
    if (buchungsnummer) {
      let id = '';
      let isFirstWhitespace = false;
      for (const c of buchungsnummer) {
        if (c !== ' ') {
          isFirstWhitespace = true;
          id += c;
        } else if (isFirstWhitespace) {
          isFirstWhitespace = false;
          id += '-';
        }
      }
      return id;
    }
    return undefined;
  }
}
