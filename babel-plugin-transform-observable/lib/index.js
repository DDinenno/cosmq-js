"use strict";

exports.__esModule = true;

exports.default = function (babel) {
  const { types: t } = babel;
  const observableVariableDeclarations = [];

  function isWrappedInComputedFunc(path) {
    if (!path) return;
    if (path.type === "CallExpression") {
      if (
        path.node.callee.object.name === "PlaceholderJs" &&
        path.node.callee.property.name === "compute"
      )
        return true;
    }

    if (path.parent) return isWrappedInComputedFunc(path.parentPath);

    return false;
  }

  function isWrappedInPlaceholderJsMethod(path) {
    if (!path || path.parentPath == null) return;
    if (path.parent.type === "CallExpression") {
      const callee = path.parentPath.node.callee;
      if (callee.object.name === "PlaceholderJs") return true;
    }

    return isWrappedInPlaceholderJsMethod(path.parentPath);
  }

  function isObservable(node) {
    return (
      node.type === "Identifier" &&
      observableVariableDeclarations.includes(node.name)
    );
  }

  function templateLiteralIncludesObservable(node) {
    const found = [];
    const alreadyExists = (n) => found.find((f) => f.name === n.name);
    const recurse = (n) =>
      templateLiteralIncludesObservable(n).filter(
        (observable) => !alreadyExists(observable)
      );

    if (node.type === "MemberExpression") {
      if (
        isObservable(node.object) &&
        !alreadyExists(node.object) &&
        node.property.name !== "value"
      ) {
        found.push(node.object);
      }
    } else if (isObservable(node)) {
      if (!alreadyExists(node)) found.push(node);
    } else if (node.expressions) {
      node.expressions.forEach((n) => {
        found.push(...recurse(n));
      });
    }

    return found;
  }

  return {
    name: "ast-transform", // not required
    visitor: {
      VariableDeclaration(path) {
        path.node.declarations.forEach((declaration) => {
          const init = declaration.init;
          if (init) {
            if (init.type === "NewExpression") {
              if (["Observable", "Formula"].includes(init.callee.name)) {
                observableVariableDeclarations.push(declaration.id.name);
              } else if (init.callee.type === "MemberExpression") {
                if (
                  ["Observable", "Formula"].includes(init.callee.property.name)
                ) {
                  observableVariableDeclarations.push(declaration.id.name);
                }
              }
            } else if (init.type === "CallExpression") {
              if (
                init.callee.object &&
                init.callee.object.name === "PlaceholderJs" &&
                init.callee.property &&
                init.callee.property.name === "compute"
              )
                observableVariableDeclarations.push(declaration.id.name);
            } else if (init.type === "Identifier") {
              if (observableVariableDeclarations.includes(init.name)) {
                observableVariableDeclarations.push(declaration.id.name);
              }
            }
          }
        });
      },
      TemplateLiteral(path) {
        if (isWrappedInComputedFunc(path)) return;
        const observables = templateLiteralIncludesObservable(path.node);

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
        const expressions = [
          "MemberExpression",
          "AssignmentExpression",
          "BinaryExpression",
          "LogicalExpression",
          "ArrayExpression",
          "TemplateLiteral",
          "CallExpression",
        ];

        if (observableVariableDeclarations.includes(path.node.name)) {
          if (expressions.includes(path.parent.type)) {
            if (path.parent.type === "MemberExpression") {
              if (["set", "value"].includes(path.parent.property.name)) return;
            }

            if (path.parent.type === "ArrayExpression") {
              if (isWrappedInPlaceholderJsMethod(path)) return;
            }

            const callee = t.memberExpression(
              t.identifier(path.node.name),
              t.identifier("value")
            );
            const methodCall = t.expressionStatement(callee);
            path.replaceWith(methodCall, path.node);
          }
        }
      },
      AssignmentExpression(path) {
        const assignTo = path.node.left.name;
        if (observableVariableDeclarations.includes(assignTo)) {
          const callee = t.memberExpression(
            t.identifier(assignTo),
            t.identifier("set")
          );
          const methodCall = t.callExpression(callee, [path.node.right]);
          path.replaceWith(methodCall, path.node);
        }
      },
    },
  };
};

module.exports = exports["default"];
