import { Rule } from 'eslint';

export function create(context: Rule.RuleContext) {
  return {
    MethodDefinition(node: any) {
      const methodName = node.key.name;
      const className = node.parent.parent.type === 'ClassDeclaration' ? node.parent.parent : undefined;
      const isConstructor = methodName === 'constructor' && className !== undefined;

      if (isConstructor) {
        context.report({
          node,
          message: 'constructor found'
        });
      }
    }
  }
}