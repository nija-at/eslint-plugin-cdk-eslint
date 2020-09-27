const importRecords: { [file: string]: string[] } = {};

export function pushRecord(file: string, importName: string): void {
  if (file in importRecords) {
    if (!importRecords[file].includes(importName)) {
      importRecords[file].push(importName);
    }
  } else {
    importRecords[file] = [importName];
  }
}

export function checkRecord(file: string, importName: string): boolean {
  if (file in importRecords && importRecords[file].includes(importName)) {
    return true;
  }
  return false;
}