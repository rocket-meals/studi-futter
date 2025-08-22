// small jest test
import { describe, expect, it, jest } from '@jest/globals';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { Cashregisters_SWOSY } from '../../Cashregisters_SWOSY';

describe('Test Swosy Cashregister Parser', () => {
  const html = fs.readFileSync(path.resolve(__dirname, './Kassendaten.html'), 'utf8');
  //const html = "oisuhefioseufh"
  //console.log(html);

  const urlToRemote = 'https://share.sw-os.de/swosy-kassendaten-2h';
  const password = 'password';

  let parser = new Cashregisters_SWOSY(urlToRemote, password);

  it('should parse an example file of transactions', async () => {
    jest.spyOn(axios, 'request').mockImplementation(options => {
      //console.log(options.url);
      //console.log(options);

      if (options.url === urlToRemote) {
        return Promise.resolve({ data: html });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    expect(Cashregisters_SWOSY.transformDate('21.08.2024 14:37:57')).toBe('2024-08-21T14:37:57');

    let transactions = await parser.getTransactionsList();
    expect(transactions.length).toBeGreaterThan(0);
    const searchTransactionId = Cashregisters_SWOSY.transformBuchungsnummer('1901     3279      322        1');
    let foundTransaction = transactions.find(t => t.baseData.id === searchTransactionId);
    expect(foundTransaction).toBeDefined();
    expect(foundTransaction?.baseData.id).toBe(searchTransactionId);
    expect(foundTransaction?.baseData.quantity).toBe(1);
    expect(foundTransaction?.baseData.name).toBe('Bio-Kaffee');
    expect(foundTransaction?.baseData.date).toBe('2024-08-21T14:37:57'); // 21.08.2024 14:37:57
    expect(foundTransaction?.cashregister_external_idenfifier).toBe('1901');

    /**
        let transactions = await parser.getTransactionsList();
        expect(transactions.length).toBeGreaterThan(0);
            */
  });
});
