import { Rule } from 'eslint';
import { type } from 'os';
import { pushRecord, checkRecord } from '../private/import-cache';

const BANNED_CLASSES = [ 'Construct', 'IConstruct' ];

export function create(context: Rule.RuleContext): Rule.NodeListener {
  return {

    // `node` is a type from @typescript-eslint/typescript-estree, but using 'any' for now
    // since it's incompatible with eslint.Rule namespace. Waiting for better compatibility in
    // https://github.com/typescript-eslint/typescript-eslint/tree/1765a178e456b152bd48192eb5db7e8541e2adf2/packages/experimental-utils#note
    // Meanwhile, use a debugger to explore the AST node.

    ImportDeclaration(node: any) {
      if (node.source.value === '@aws-cdk/core') {
        node.specifiers.forEach((s: any) => {
          let name: string;
          if (s.type === 'ImportSpecifier' && BANNED_CLASSES.includes(s.imported.name)) {
            pushRecord(context.getFilename(), s.local.name);
          } else if (s.type === 'ImportNamespaceSpecified') {
            BANNED_CLASSES.forEach(c => pushRecord(context.getFilename(), `${s.local.name}.${c}`));
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
          let typeAnnotation;
          if (p.type === 'Identifier' || p.type === 'RestElement') {
            typeAnnotation = p.typeAnnotation.typeAnnotation;
          } else if (p.type === 'TSParameterProperty') {
            if (p.parameter.type === 'AssignmentPattern') {
              typeAnnotation = p.parameter.left.typeAnnotation.typeAnnotation;
            } else {
              typeAnnotation = p.parameter.typeAnnotation.typeAnnotation;
            }
          } else if (p.type === 'AssignmentPattern') {
            typeAnnotation = p.left.typeAnnotation.typeAnnotation;
          } else {
            throw new Error(`Unknown parameter type ${p.type}`);
          }

          let typeName: string | undefined;
          if (typeAnnotation.type === 'TSTypeReference') {
            typeName = typeAnnotation.typeName.name;
          } else if (typeAnnotation.type === 'TSArrayType' && typeAnnotation.elementType.type === 'TSTypeReference') {
            typeName = typeAnnotation.elementType.typeName.name;
          } else if (typeAnnotation.type === 'TSQualifiedName') {
            typeName = `${typeAnnotation.left.name}.${typeAnnotation.right.name}`;
          }
          if (typeName && checkRecord(context.getFilename(), typeName)) {
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