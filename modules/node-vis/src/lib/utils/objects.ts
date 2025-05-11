/** Finds all values in `obj` stored under symbol keys */
export const symbol_values = <T>(obj: { [key: symbol]: T }): T[] =>
  Object.getOwnPropertySymbols(obj).map((k) => obj[k]);
