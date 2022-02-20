"use strict";

exports.__esModule = true;

exports.default = function (babel) {
  const { types: t } = babel;
  const observableVariableDeclarations = [];

  function isWrappedInComputedFunction(path) {
    if (path.parent.type === "ArrowFunctionExpression") {
      if (
        path.parentPath.parent.type === "CallExpression" &&
        path.parentPath.parent.callee.object.name === "PlaceholderJs" &&
        path.parentPath.parent.callee.property.name === "compute"
      )
        return true;
    }
  }

  function isWrappedInPlaceholderJsMethod(path) {
    if (!path || path.parentPath == null) return;
    if (path.parent.type === "CallExpression") {
      const callee = path.parentPath.node.callee;
      if (callee.object.name === "PlaceholderJs") return true;
    }

    return isWrappedInPlaceholderJsMethod(path.parentPath);
  }

  function isPropValue(path) {
    return (
      path.parent.type === "JSXExpressionContainer" &&
      path.parentPath.parent.type === "JSXAttribute"
    );
  }

  function arrayIncludesObservable(expression) {
    return expression.elements.some(
      (e) =>
        e.type === "Identifier" &&
        observableVariableDeclarations.includes(e.name)
    );
  }

  function templateLiteralIncludesObservable(exp) {
    return exp.expressions.find(
      (e) =>
        e.type === "Identifier" &&
        observableVariableDeclarations.includes(e.name)
    );
  }

  return {
    name: "ast-transform", // not required
    visitor: {
      VariableDeclaration(path) {
        path.node.declarations.forEach((declaration) => {
          const init = declaration.init;
          if (init) {
            if (init.type === "NewExpression") {
              if (init.callee.name === "Observable") {
                observableVariableDeclarations.push(declaration.id.name);
              } else if (init.callee.type === "MemberExpression") {
                if (init.callee.property.name === "Observable") {
                  observableVariableDeclarations.push(declaration.id.name);
                }
              }
            }

            if (init.type === "Identifier") {
            
              if (observableVariableDeclarations.includes(init.name)) {
                observableVariableDeclarations.push(declaration.id.name);
              }
            }
          }
        });
      },
      JSXExpressionContainer(path) {
        if (path.parent.type === "JSXAttribute") {
          const exp = path.node.expression;

          if (exp.type === "ArrayExpression") {
            if (arrayIncludesObservable(exp)) {
              const callee = t.memberExpression(
                t.identifier("PlaceholderJs"),
                t.identifier("compute")
              );
              const arrowFunc = t.ArrowFunctionExpression(
                [],
                t.arrayExpression(exp.elements)
              );
              const callExpression = t.callExpression(callee, [arrowFunc]);
              // path.replaceWith(t.JSXExpressionContainer(callExpression), path.node);
            }
          }

          if (exp.type === "TemplateLiteral") {
            if (templateLiteralIncludesObservable(exp)) {
              const callee = t.memberExpression(
                t.identifier("PlaceholderJs"),
                t.identifier("compute")
              );
              const arrowFunc = t.ArrowFunctionExpression([], exp);
              const callExpression = t.callExpression(callee, [arrowFunc]);
              //  path.replaceWith(t.JSXExpressionContainer(callExpression), path.node);
            }
          }
        }
      },
      TemplateLiteral(path) {
        if (isWrappedInComputedFunction(path)) return;

        
        if (templateLiteralIncludesObservable(path.node)) {
          const callee = t.memberExpression(
            t.identifier("PlaceholderJs"),
            t.identifier("compute")
          );
          const arrowFunc = t.ArrowFunctionExpression([], path.node);
          const callExpression = t.callExpression(callee, [arrowFunc]);
          path.replaceWith(callExpression, path.node);
        }
      },
      ArrayExpression(path) {
        if (isWrappedInComputedFunction(path)) return;

        const observablesFound = [];

        path.node.elements.forEach((element) => {
          if (element.type === "Identifier") {
            if (observableVariableDeclarations.includes(element.name)) {
              observablesFound.push(element);
            }
          }
        });

        if (observablesFound.length) {
          const callee = t.memberExpression(
            t.identifier("PlaceholderJs"),
            t.identifier("compute")
          );
          const arrowFunc = t.ArrowFunctionExpression(
            [],
            t.arrayExpression(path.node.elements)
          );
          const callExpression = t.callExpression(callee, [arrowFunc]);
          //path.replaceWith(callExpression, path.node);
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
        ];
        //  const isExpression = path.parent.type.match(/Expression$/);
        // const excludedExpressions = ["MemberExpression", "CallExpression", "ArrayExpression"];

        if (expressions.includes(path.parent.type)) {
          if (observableVariableDeclarations.includes(path.node.name)) {
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
