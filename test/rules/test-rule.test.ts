import { ESLint } from 'eslint';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { rules } from '../../lib';

const linter = new ESLint({
  overrideConfigFile: path.join(__dirname, 'eslintrc.js'),
  rulePaths: [
    path.join(__dirname, '../../lib/rules'),
  ],
  fix: true,
});

const outputDir = fs.mkdtempSync(os.tmpdir())
const fixturesDir = path.join(__dirname, 'fixtures');

describe('test-rule', () => {
  const fixtureFiles = fs.readdirSync(fixturesDir).filter(f => f.endsWith('.ts') && !f.endsWith('.expected.ts'));
  fixtureFiles.forEach(f => {
    test(f, async () => {
      const actual = await lintAndFix(path.join(fixturesDir, f));
      const expected = path.join(fixturesDir, `${path.basename(f, '.ts')}.expected.ts`);
      expect(await fs.readFile(actual, { encoding: 'utf8' })).toEqual(await fs.readFile(expected, { encoding: 'utf8' }));
    });
  });
});

async function lintAndFix(file: string) {
  const newPath = path.join(outputDir, path.basename(file))
  let result = await linter.lintFiles(file);
  await ESLint.outputFixes(result.map(r => {
    console.log(`Linted form of ${r.filePath} is at ${newPath}`);
    r.filePath = newPath;
    return r;
  }));
  return newPath;
}