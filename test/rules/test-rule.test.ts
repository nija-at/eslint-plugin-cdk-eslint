import { ESLint } from 'eslint';
import * as fs from 'fs-extra';
import * as path from 'path';
import { rules } from '../../lib';

const linter = new ESLint({
  overrideConfigFile: path.join(__dirname, 'eslintrc.js'),
  rulePaths: [
    path.join(__dirname, '../../lib/rules'),
  ]
});

describe('test-rule', () => {
  describe('invalid', () => {
    const invalidDir = path.join(__dirname, 'test-rule', 'invalid');
    test('constructor', async () => {
      let result = await linter.lintFiles(path.join(invalidDir, 'constructor.ts'));
      const errorCount = result.reduce((agg, r) => agg + r.errorCount, 0);
      expect(errorCount).toEqual(6);
      expect(rulesViolated(result)).toEqual(['rulesdir/test-rule']);
    });
  });

  describe('valid', () => {
    const validDir = path.join(__dirname, 'test-rule', 'valid');
    const files = tsFiles(validDir);

    files.forEach(f => {
      const testName = path.basename(f, '.ts')
      test(testName, async () => {
        const result = await linter.lintFiles(path.join(validDir, f));
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

function rulesViolated(result: ESLint.LintResult[]): string[] {
  const rulesViolated = new Set<string>();
  result.forEach(r => r.messages.forEach(m => { if (m.ruleId) rulesViolated.add(m.ruleId) }));
  return Array.from(rulesViolated);
}