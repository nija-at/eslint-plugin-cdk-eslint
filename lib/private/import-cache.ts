import * as crypto from 'crypto';

type Node = any;

let importRecords: { [key: string]: Node } = {};

export function pushRecord(file: string, importName: string, node: Node): void {
  importRecords[hashed(file, importName)] = node;
}

export function getRecord(file: string, importName: string): Node | undefined {
  return importRecords[hashed(file, importName)];
}

export function clear() {
  importRecords = {};
}

function hashed(file: string, importName: string): string {
  const hash = crypto.createHash('md5');
  hash.update(`${file}:${importName}`);
  return hash.digest('hex');
}