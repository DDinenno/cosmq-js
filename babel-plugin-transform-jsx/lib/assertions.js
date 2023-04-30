function matchParentRecursively(path, matcher) {
  if (!path) return false;
  if (matcher(path)) return true;
  return matchParentRecursively(path.parentPath, matcher);
}

function isInTemplateLiteral(path) {
  return matchParentRecursively(path, (p) => p.node.type === "TemplateLiteral");
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

function isWrappedInPropertyValueGetter(path) {
  return matchParentRecursively(path, (parentPath) =>
    placeholderJsMethodMatchesProperty(parentPath.node, "getPropValue")
  );
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

function isInComponentProps(path) {
  return matchParentRecursively(path, (parentPath) => {
    return placeholderJsMethodMatchesProperty(
      parentPath.node.callee,
      "registerComponent"
    );
  });
}

function isComponentIdentifier(node) {
  return /^Component_/.test(node.name);
}

function isComponentFunction(path) {
  if (path.node.type === "FunctionDeclaration") {
    return isComponentIdentifier(path.node.id);
  } else if (
    path.node.type === "VariableDeclaration" &&
    path.node.declarations[0] &&
    path.node.declarations[0].init &&
    path.node.declarations[0].init.type === "ArrowFunctionExpression"
  ) {
    return isComponentIdentifier(path.node.declarations[0].id);
  }

  return false;
}

function isInComponentBody(path) {
  return matchParentRecursively(path, (p) => {
    // TODO: refactor for normal function style
    if (p.node.type !== "VariableDeclarator") return;
    if (p.node.init.type !== "ArrowFunctionExpression") return;

    const binding = p.scope.bindings[p.node.id.name];
    if (!binding) return;

    return binding.referencePaths.some(isInComponentProps);
  });
}

function isInBlockStatement(path) {
  return matchParentRecursively(
    path,
    (parentPath) => parentPath.type === "BlockStatement"
  );
}

function isWrappedInSetter(path) {
  return matchParentRecursively(
    path,
    (p) =>
      p.node.type === "CallExpression" &&
      p.node.callee.type === "MemberExpression" &&
      p.node.callee.property.name === "set"
  );
}

module.exports = {
  isWrappedInConditionalStatement,
  isWrappedInComputedFunc,
  isWrappedInComputedShorthand,
  isWrappedInPropertyValueGetter,
  bodyContainsContext,
  isInComputedDeps,
  placeholderJsMethodMatchesProperty,
  isInTemplateLiteral,
  matchParentRecursively,
  isInComponentProps,
  isInComponentBody,
  isComponentFunction,
  isComponentIdentifier,
  isInBlockStatement,
  isWrappedInSetter,
};
