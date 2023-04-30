function matchParentRecursively(path, matcher) {
  if (!path) return false;
  if (matcher(path)) return true;
  return matchParentRecursively(path.parentPath, matcher);
}

function isInComponent(path) {
  return matchParentRecursively(path, (parentPath) => {
    if (parentPath.node.type === "BlockStatement") {
      return parentPath.node.body.find((node) => {
        if (node.type === "VariableDeclaration") {
          return node.declarations.find((dec) => {
            return dec.id && dec.id.name === "_component_context";
          });
        }
      });
    }
  });
}

function isInTemplateLiteral(path) {
  return matchParentRecursively(path, (p) => p.node.type === "TemplateLiteral");
}

function isInComponentProps(path) {
  return matchParentRecursively(path, (parentPath) => {
    return placeholderJsMethodMatchesProperty(
      parentPath.node.callee,
      "registerComponent"
    );
  });
}

function isObservable(path, name) {
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

function findNestedObservables(path) {
  const found = [];

  path.traverse({
    Identifier(p) {
      if (isObservable(p, p.node.name)) {
        if (!found.find((n) => n.name === p.node.name)) found.push(p.node);
      }
    },
  });

  return found;
}

function placeholderJsMethodMatchesProperty(node, property) {
  if (!node) return;
  if (node.type === "MemberExpression") {
    if (node.object.name === "PlaceholderJs") {
      return node.property.name === property;
    }
  }
  if (node.type === "CallExpression")
    return placeholderJsMethodMatchesProperty(node.callee, property);
  return false;
}

function isInComputedDeps(path) {
  if (path.parent == null) return false;
  if (path.type === "ArrayExpression") {
    if (
      placeholderJsMethodMatchesProperty(path.parent.callee, "compute") ||
      placeholderJsMethodMatchesProperty(path.parent.callee, "conditional")
    )
      return true;
  }
  if (path.parentPath) return isInComputedDeps(path.parentPath);
}

function getRootBoundNode(path, name) {
  const binding = path.scope.getBinding(name);
  if (!binding) return;

  let init = binding.path.node.init;
  if (init && init.type === "Identifier")
    return getRootBoundNode(path, init.name);
  return binding;
}

function bodyContainsContext(path) {
  return path.parent.body.find((node) => {
    if (node.type === "VariableDeclaration") {
      return node.declarations.find(
        (dec) =>
          dec.type === "VariableDeclarator" &&
          dec.id.name === "_component_context"
      );
    }
  });
}

function isWrappedInComputedShorthand(path) {
  return matchParentRecursively(
    path,
    (p) => p.node.callee && p.node.callee.name === "compute"
  );
}

function isWrappedInComputedFunc(path) {
  return matchParentRecursively(path, (p) =>
    placeholderJsMethodMatchesProperty(p.node.callee, "compute")
  );
}

function isInConditionalCondition(path) {
  return matchParentRecursively(
    path,
    (p) => p.type === "ObjectProperty" && p.node.key.value === "__condition__"
  );
}

function isWrappedInConditionalStatement(path) {
  return matchParentRecursively(
    path,
    (p) =>
      placeholderJsMethodMatchesProperty(p.node.callee, "conditional") &&
      isInConditionalCondition(path)
  );
}

function expressionContainsObservables(path) {
  if (isWrappedInComputedFunc(path)) return;
  if (isWrappedInConditionalStatement(path)) return;
  if (placeholderJsMethodMatchesProperty(path.node, "conditional")) return;

  const observables = findNestedObservables(path);
  return observables.length > 0;
}

module.exports = {
  expressionContainsObservables,
  getRootBoundNode,
  isWrappedInComputedFunc,
  isWrappedInComputedShorthand,
  isWrappedInConditionalStatement,
  placeholderJsMethodMatchesProperty,
  findNestedObservables,
  isObservable,
};
