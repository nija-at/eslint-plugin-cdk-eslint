import { ESLint } from 'eslint';
import * as fs from 'fs-extra';
import * as path from 'path';

const linter = new ESLint({
  overrideConfigFile: path.join(__dirname, 'eslintrc.js'),
  rulePaths: [
    path.join(__dirname, '../../lib/rules'),
  ]
});

describe('test-rule', () => {
  describe('invalid', () => {
    
    const invalidDir = path.join(__dirname, 'test-rule', 'invalid');
    const files = tsFiles(invalidDir);

    files.forEach(f => {
      const testName = path.basename(f, '.ts')
      test(testName, async () => {
        const result = await linter.lintFiles(path.join(invalidDir, f));
        const resultString = (await linter.loadFormatter()).format(result);
        expect(resultString).toBeFalsy();
      });
    });
  });

  describe('valid', () => {
    
    const invalidDir = path.join(__dirname, 'test-rule', 'valid');
    const files = tsFiles(invalidDir);

    files.forEach(f => {
      const testName = path.basename(f, '.ts')
      test(testName, async () => {
        const result = await linter.lintFiles(path.join(invalidDir, f));
        const resultString = (await linter.loadFormatter()).format(result);
        expect(resultString).toBeFalsy();
      });
    });
  });
});

function tsFiles(dir: string) {
  const files = fs.readdirSync(dir);
  return files.filter(f => f.endsWith('.ts'));
}