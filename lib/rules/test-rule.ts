import { Rule } from 'eslint';
import { type } from 'os';
import { pushRecord, getRecord, clear } from '../private/import-cache';

const BANNED_CLASSES = [ 'Construct', 'IConstruct' ];

export function create(context: Rule.RuleContext): Rule.NodeListener {
  return {

    // `node` is a type from @typescript-eslint/typescript-estree, but using 'any' for now
    // since it's incompatible with eslint.Rule namespace. Waiting for better compatibility in
    // https://github.com/typescript-eslint/typescript-eslint/tree/1765a178e456b152bd48192eb5db7e8541e2adf2/packages/experimental-utils#note
    // Meanwhile, use a debugger to explore the AST node.

    Program(node: any) {
      if (!isTestFile(context.getFilename())) {
        return;
      }
      clear();
    },

    ImportDeclaration(node: any) {
      if (!isTestFile(context.getFilename())) {
        return;
      }
      if (node.source.value === '@aws-cdk/core') {
        node.specifiers.forEach((s: any) => {
          if (s.type === 'ImportSpecifier' && BANNED_CLASSES.includes(s.imported.name)) {
            pushRecord(context.getFilename(), s.imported.name, node);
          } else if (s.type === 'ImportNamespaceSpecifier') {
            BANNED_CLASSES.forEach(c => pushRecord(context.getFilename(), `${s.local.name}.${c}`, node));
          }
        });
      }
    },

    Identifier(node: any) {
      if (!isTestFile(context.getFilename())) {
        return;
      }
      if (!node.typeAnnotation?.typeAnnotation) {
        return;
      }
      const type = node.typeAnnotation.typeAnnotation.typeName;
      if (!type) { return; }
      if (type.type === 'TSQualifiedName') {
        const fqn = `${type.left.name}.${type.right.name}`;
        const importNode = getRecord(context.getFilename(), fqn);
        if (!importNode) {
          return;
        }
        context.report({
          node,
          message: 'Cannot use this',
          fix: (fixer: Rule.RuleFixer) => {
            const fixes: Rule.Fix[] = []; 
            fixes.push(fixer.insertTextAfter(importNode, "\nimport { Construct } from 'constructs';"));
            fixes.push(fixer.replaceTextRange(node.typeAnnotation.typeAnnotation.range, 'Construct'));
            return fixes;
          }
        });
      } else if (type.type === 'Identifier') {
        const fqn = type.name;
        const importNode = getRecord(context.getFilename(), fqn);
        if (!importNode) {
          return;
        }
        context.report({
          node,
          message: 'Cannot use this',
          fix: (fixer: Rule.RuleFixer) => {
            const fixes: Rule.Fix[] = [];
            fixes.push(fixer.insertTextAfter(importNode, "\nimport { Construct } from 'constructs';"));
            const specifiers = importNode.specifiers;
            for (let i = 0; i < specifiers.length; i++) {
              const s = specifiers[i];
              if (s.imported.name === fqn) {
                if (specifiers.length === 1) { // only node
                  fixes.push(fixer.removeRange(importNode.range));
                } else if (i === specifiers.length - 1) {
                  fixes.push(fixer.removeRange(s.range));
                } else {
                  fixes.push(fixer.removeRange([s.range[0], s.range[1] + 2])); // include the trailing comma and space
                }
              }
            }
            return fixes;
          }
        });
      } else {
        throw new Error('Unknown type'); // FIXME
      }
    },
  }
}

function isTestFile(filename: string) {
  const isJestTest = new RegExp(/\/test\/.*test\.ts$/).test(filename);;
  const isNodeUnitTest = new RegExp(/\/test\/.*test\.[^/]+\.ts$/).test(filename);
  const isIntegTest = new RegExp(/\/test\/.*integ\.[^/]+\.ts$/).test(filename);
  return isJestTest || isNodeUnitTest || isIntegTest;
}