"use strict";

exports.__esModule = true;

function matchParentRecursively(path, matcher) {
  if (!path) return false;
  if (matcher(path)) return true;
  return matchParentRecursively(path.parentPath, matcher);
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

function isWrappedInComputedFunc(path) {
  if (!path) return false;
  if (placeholderJsMethodMatchesProperty(path.node.callee, "compute"))
    return true;
  if (path.parent) return isWrappedInComputedFunc(path.parentPath);
  return false;
}

const conditionalExpressions = ["IF", "ELSEIF", "ELSE"];
function isConditionalStatement(path) {
  if (!path) return;
  return (
    path.type === "CallExpression" &&
    (conditionalExpressions.includes(
      path.node.callee && path.node.callee.name
    ) ||
      conditionalExpressions.includes(
        path.node.callee.callee && path.node.callee.callee.name
      ))
  );
}

exports.default = function (babel) {
  const { types: t } = babel;

  function transformIdentifier(path) {
    if (!path.node || !path.parent) return;
    if (path.parent.type === "VariableDeclarator") return;

    const name = path.node.name;
    const observable = isObservable(path, name);

    if (observable) {
      if (path.parent.type === "CallExpression") {
        if (
          placeholderJsMethodMatchesProperty(
            path.parentPath.node.callee,
            "evalObservable"
          )
        )
          return;

        const parentFunctionBinding = getRootBoundNode(
          path,
          path.parentPath.node.callee.name
        );

        if (parentFunctionBinding) {
          const params = parentFunctionBinding.path.node.params;
          const paramNode = params[path.key];

          const paramHasSetterIdentifier = /^\$/.test(paramNode.name);
          if (paramHasSetterIdentifier) return;
        }
      }

      if (path.parent.type === "MemberExpression") {
        if (["set", "value"].includes(path.parent.property.name)) return;
      }

      if (path.parent.type === "JSXExpressionContainer") {
        return;
      }

      if (path.parent.type === "ArrayExpression") {
        if (isInComputedDeps(path)) return;
      }

      if (isInComponentProps(path)) return;

      const callee = t.memberExpression(
        t.identifier(path.node.name),
        t.identifier("value")
      );
      const methodCall = t.expressionStatement(callee);
      path.replaceWith(methodCall, path.node);
    }
  }

  function transformToComputedIfContainsObservables(path) {
    if (isWrappedInComputedFunc(path)) return;
    if (isConditionalStatement(path) || isConditionalStatement(path.parentPath))
      return;
    if (placeholderJsMethodMatchesProperty(path.node, "conditional")) return;

    const observables = findNestedObservables(path);
    if (observables.length) {
      const callee = t.memberExpression(
        t.identifier("PlaceholderJs"),
        t.identifier("compute")
      );

      const arrowFunc = t.ArrowFunctionExpression([], path.node);
      const depArray = t.arrayExpression(observables);
      const callExpression = t.callExpression(callee, [arrowFunc, depArray]);
      path.replaceWith(callExpression, path.node);
    }
  }

  return {
    name: "ast-transform", // not required
    visitor: {
      VariableDeclaration(path) {
        let initObservable = false;

        path.node.declarations.forEach((declaration) => {
          const init = declaration.init;

          if (
            init &&
            init.callee &&
            (init.callee.type === "CallExpression" ||
              init.callee.type === "MemberExpression")
          ) {
            if (["observe", "compute"].includes(init.callee.property.name)) {
              initObservable = true;
            }
          }
        });

        if (initObservable && !bodyContainsContext(path)) {
          path.insertBefore(
            t.variableDeclaration("const", [
              t.variableDeclarator(
                t.identifier("_component_context"),
                t.callExpression(
                  t.MemberExpression(
                    t.identifier("PlaceholderJs"),
                    t.identifier("getComponentContext")
                  ),
                  []
                )
              ),
            ])
          );
        }
      },
      TemplateLiteral(path) {
        if (isWrappedInComputedFunc(path)) return;
        const observables = findNestedObservables(path);

        if (observables.length) {
          const callee = t.memberExpression(
            t.identifier("PlaceholderJs"),
            t.identifier("compute")
          );

          const arrowFunc = t.ArrowFunctionExpression([], path.node);
          const depArray = t.arrayExpression(observables);
          const callExpression = t.callExpression(callee, [
            arrowFunc,
            depArray,
          ]);
          path.replaceWith(callExpression, path.node);
        }
      },
      Identifier(path) {
        transformIdentifier(path);
      },
      FunctionDeclaration(path) {
        const params = path.node.params;
        const observableSetters = [];

        path.traverse({
          AssignmentExpression(p) {
            const hasObservableSetIdentifier = /^\$/.test(p.node.left.name);
            if (!hasObservableSetIdentifier) return;
            const observableIndentifier = p.node.left.name.replace(/^\$/, "");
            observableSetters.push(observableIndentifier);

            params.forEach((param) => {
              if (param.name === observableIndentifier) {
                p.insertBefore(
                  t.variableDeclaration("const", [
                    t.variableDeclarator(
                      t.identifier(observableIndentifier),
                      t.identifier(`$${param.name}`)
                    ),
                  ])
                );
              }
            });
          },
        });

        if (observableSetters.length) {
          path.traverse({
            Identifier(p) {
              if (p.listKey === "params") {
                observableSetters.forEach((name) => {
                  if (name === p.node.name) {
                    p.replaceWith(t.identifier(`$${name}`));
                  }
                });
              }
            },
          });
        }
      },
      AssignmentExpression(path) {
        const hasObservableSetIdentifier = /^\$/.test(path.node.left.name);
        if (!hasObservableSetIdentifier) return;

        const assignTo = path.node.left.name.replace(/^\$/, "");

        if (hasObservableSetIdentifier) {
          const symbol = t.memberExpression(
            t.identifier("_component_context"),
            t.identifier("symbol")
          );

          const evalCallee = t.memberExpression(
            t.identifier("PlaceholderJs"),
            t.identifier("evalObservable")
          );

          const setterArgs = [path.node.right, symbol];

          path.replaceWith(
            t.callExpression(
              t.memberExpression(
                t.callExpression(evalCallee, [t.identifier(assignTo)]),
                t.identifier("set")
              ),
              setterArgs
            ),
            path.node
          );
        }
      },
      JSXExpressionContainer(path) {
        const replaceExpressions = {
          BinaryExpression: transformToComputedIfContainsObservables,
          CallExpression: transformToComputedIfContainsObservables,
        };

        path.traverse({
          ...replaceExpressions,
          Identifier(p) {
            const binding = getRootBoundNode(p, p.node.name);
            if (!binding) return;

            binding.path.traverse(replaceExpressions);

            binding.referencePaths.forEach((refPath) => {
              if (refPath !== p) transformIdentifier(refPath);
            });
          },
        });
      },
    },
  };
};

module.exports = exports["default"];
