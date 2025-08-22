export interface FormsSyncInterface {
  /**
   * This method should create the needed data for the parser to work on every call of the parser.
   */
  createNeededData(): Promise<void>;
}
