import { Rule } from 'eslint';

export function create(context: Rule.RuleContext) {
  return {
    // `node` is a type from @typescript-eslint/typescript-estree, but using 'any' for now
    // since compatibility with eslint is still experimental and is hard to get them to work together
    // Meanwhile, use https://astexplorer.net/ with parser set to 'babel-eslint' and transfrom set to
    // 'ESLint v4' to explore the AST.
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