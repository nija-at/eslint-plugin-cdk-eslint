import { ESLint } from 'eslint';
import * as fs from 'fs-extra';
import * as path from 'path';

const linter = new ESLint({
  overrideConfigFile: path.join(__dirname, 'eslintrc.json'),
});

describe('test-rule', () => {
  describe('invalid', () => {
    
    const invalidDir = path.join(__dirname, 'test-rule', 'invalid');
    const files = fs.readdirSync(invalidDir);
    const tsFiles = files.filter(f => f.endsWith('.ts'));

    tsFiles.forEach(f => {
      const testName = path.basename(f, '.ts')
      test(testName, async () => {
        const result = await linter.lintFiles(path.join(invalidDir, f));
        let messages: string | undefined = undefined;
        if (result.length > 0) {
          const msgs: string[] = [];
          result[0].messages.forEach(m => { // [0], since only linting one file
            msgs.push(`[${m.ruleId}] ${m.message} @ ${m.line}:${m.column}`);
          });
          messages = msgs.join('\n');
        }
        expect(messages).toBeUndefined();
      });
    });
  });
});