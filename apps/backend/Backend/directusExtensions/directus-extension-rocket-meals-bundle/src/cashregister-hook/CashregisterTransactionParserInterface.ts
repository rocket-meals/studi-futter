import { DatabaseTypes } from 'repo-depkit-common';

export type CashregistersTransactionsOmmitedFields = Omit<DatabaseTypes.CashregistersTransactions, 'cashregister' | 'created_on' | 'updated_on' | 'created_by' | 'updated_by' | 'status'>;
export type CashregistersTransactionsForParser = {
  baseData: CashregistersTransactionsOmmitedFields;
  cashregister_external_idenfifier: string;
};

export interface CashregisterTransactionParserInterface {
  getTransactionsList(): Promise<CashregistersTransactionsForParser[]>;
}
