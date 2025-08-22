export class CSVExportParser {
  static NEW_LINE_DELIMITER = '\n';
  static INLINE_DELIMITER_TAB = '\t';
  static INLINE_DELIMITER_SEMICOLON = ';';

  static getListOfLineObjectsWithParams(text: string | Buffer | undefined, newLineDelimiter: string, inlineDelimiter: string, removeTailoringQuotes = true) {
    return CSVExportParser.getListOfLineObjects(text, {
      newLineDelimiter,
      inlineDelimiter,
      removeTailoringQuotes,
    });
  }

  static getListOfLineObjects(
    text: string | Buffer | undefined,
    options: {
      newLineDelimiter: string;
      inlineDelimiter: string;
      removeTailoringQuotes: boolean;
    }
  ) {
    let lines = CSVExportParser.splitTextIntoLines(text, options.newLineDelimiter);
    return CSVExportParser.parseFileLinesToJSONList(lines, options.inlineDelimiter, options.removeTailoringQuotes);
  }

  private static splitTextIntoLines(text: string | Buffer | undefined, delimiter = CSVExportParser.NEW_LINE_DELIMITER) {
    if (!text) {
      return [];
    }
    text = text.toString();
    return text.split(delimiter);
  }

  private static splitLineByDelimiter(line: string, delimiter = CSVExportParser.INLINE_DELIMITER_TAB, removeTailoringQuotes: boolean) {
    // raw line: '" 040";"enthält Schalenfrüchte: Mandeln";"";"27J"'
    let lineItemsList = line.split(delimiter);
    if (removeTailoringQuotes) {
      for (let i = 0; i < lineItemsList.length; i++) {
        let item = lineItemsList[i];
        if (!!item) {
          // Strip away carriage return
          if (item.endsWith('\r')) {
            item = item.substring(0, item.length - 1);
          }

          if (item.startsWith('"')) {
            item = item.substring(1);
          }
          if (item.endsWith('"')) {
            item = item.substring(0, item.length - 1);
          }

          // remove escaped quotes
          if (item.startsWith('\\"')) {
            item = item.substring(2);
          }
          if (item.endsWith('\\"')) {
            item = item.substring(0, item.length - 2);
          }

          lineItemsList[i] = item;
        }
      }
    }
    return lineItemsList;
  }

  private static parseFileLinesToJSONList(lines: string[], inlineDelimiter: string, removeTailoringQuotes: boolean) {
    let output: { [p: string]: string }[] = [];
    let identifierLineRaw = lines[0];
    if (!!identifierLineRaw) {
      let identifierLine = identifierLineRaw.trim();
      let identifierList = CSVExportParser.splitLineByDelimiter(identifierLine, inlineDelimiter, removeTailoringQuotes);
      for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        if (!!line && line !== '') {
          let lineItemList = CSVExportParser.splitLineByDelimiter(line, inlineDelimiter, removeTailoringQuotes);
          let lineObject = CSVExportParser.parseLineToJSON(lineItemList, identifierList);
          output.push(lineObject);
        }
      }
    }
    return output;
  }

  private static parseLineToJSON(lineItemList: string[], identifierList: string[]) {
    let output: {
      [key: string]: string;
    } = {};
    for (let i = 0; i < identifierList.length; i++) {
      const identifier = identifierList[i];
      if (!!identifier) {
        const value = lineItemList[i];
        if (value !== undefined && value !== null) {
          // allow empty strings
          output[identifier] = value;
        }
      }
    }
    return output;
  }
}
