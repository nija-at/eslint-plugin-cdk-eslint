import { Rule } from 'eslint';
import { pushRecord, checkRecord } from '../private/import-cache';

const BANNED_CLASSES = [ 'Construct', 'IConstruct' ];

export function create(context: Rule.RuleContext): Rule.NodeListener {
  return {

    // `node` is a type from @typescript-eslint/typescript-estree, but using 'any' for now
    // since it's incompatible with eslint.Rule namespace. Waiting for better compatibility in
    // https://github.com/typescript-eslint/typescript-eslint/tree/1765a178e456b152bd48192eb5db7e8541e2adf2/packages/experimental-utils#note
    // Meanwhile, use https://astexplorer.net/ with parser set to '@typescript-eslint/parser' and
    // transfrom set to 'ESLint v4' to explore the AST node.

    ImportDeclaration(node: any) {
      if (node.source.value === '@aws-cdk/core') {
        node.specifiers.forEach((s: any) => {
          if (BANNED_CLASSES.includes(s.imported.name)) {
            pushRecord(context.getFilename(), s.local.name);
          }
        });
      }
    },

    MethodDefinition(node: any) {
      const methodName = node.key.name;
      const className = node.parent.parent.type === 'ClassDeclaration' ? node.parent.parent : undefined;
      const isConstructor = methodName === 'constructor' && className !== undefined;

      if (isConstructor) {
        node.value.params.forEach((p: any) => {
          const typeName = p.typeAnnotation.typeAnnotation.typeName.name;
          if (checkRecord(context.getFilename(), typeName)) {
            context.report({
              node,
              message: `constructor type invalid`
            });
          }
        });
      }
    },
  }
}