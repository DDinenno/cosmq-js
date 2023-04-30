const {
  matchParentRecursively,
  placeholderJsMethodMatchesProperty,
  isComponentFunction,
  isInBlockStatement,
} = require("./assertions");

function getRootBoundNode(path, name) {
  let binding = path.scope.getBinding(name);
  if (!binding) return;

  let init = binding.path.node.init;
  if (init && init.type === "Identifier")
    return getRootBoundNode(path, init.name);
  return binding;
}

function getObservableBinding(path, name) {
  const binding = getRootBoundNode(path, name);
  if (!binding) return;

  const init = binding.path.node.init;
  if (!init) return;

  if (
    ((init.type === "CallExpression" || init.type === "MemberExpression") &&
      placeholderJsMethodMatchesProperty(init.callee, "compute")) ||
    placeholderJsMethodMatchesProperty(init.callee, "observe")
  )
    return binding;
}

function findNestedIdentifiers(path, matcher) {
  const found = [];

  path.traverse({
    Identifier(p) {
      if (matcher(p, found)) found.push(p);
    },
  });

  return found;
}

function findNestedObservables(path) {
  return findNestedIdentifiers(path, (p, found) => {
    if (getObservableBinding(p, p.node.name)) {
      return !found.find((n) => n.name === p.node.name);
    }
  });
}

function getFunctionParams(path) {
  if (!path) return [];
  switch (path.node.type) {
    case "FunctionDeclaration":
      return path.node.params || [];
    case "VariableDeclaration": {
      const declaration = path.node.declarations[0];
      if (!declaration || !declaration.init) return [];

      if (declaration.init.type === "ArrowFunctionExpression")
        return declaration.init.params;
      return declaration.init;
    }
    default:
      return [];
  }
}

function findComponentRoot(path) {
  let componentPath;

  matchParentRecursively(path, (parentPath) => {
    if (isComponentFunction(parentPath) && isInBlockStatement(path)) {
      componentPath = parentPath;
      return true;
    }
  });

  return componentPath;
}

module.exports = {
  getRootBoundNode,
  getObservableBinding,
  findNestedIdentifiers,
  findNestedObservables,
  getFunctionParams,
  findComponentRoot,
};
