"use strict";
const {
  isWrappedInComputedFunc,
  isWrappedInConditionalStatement,
  placeholderJsMethodMatchesProperty,
  isWrappedInComputedShorthand,
  isWrappedInPropertyValueGetter,
  isInComputedDeps,
  isInComponentProps,
  isWrappedInSetter,
} = require("./assertions");

const query = require("./query");

exports.__esModule = true;

function shouldTransformObservable(path) {
  if (!path.node || !path.parent) return;
  if (path.parent.type === "VariableDeclarator") return;

  const name = path.node.name;
  const observable = query.getObservableBinding(path, name);

  if (observable) {
    if (path.parent.type === "MemberExpression") {
      if (["set", "value"].includes(path.parent.property.name)) return;
    }

    if (["JSXExpressionContainer", "JSXAttribute"].includes(path.parent.type)) {
      return;
    }

    if (path.parent.type === "ArrayExpression") {
      if (isInComputedDeps(path)) return;
    }

    if (isInComponentProps(path)) return;

    return true;
  }
}

exports.default = function (babel) {
  const { types: t } = babel;

  function getProperties(path) {
    const attrsObject = t.objectExpression([]);
    const attributes = path.node.openingElement.attributes;

    const mapProperties = attributes.map((attr) => {
      let property;
      let value;

      if (attr.name.type === "JSXNamespacedName")
        property = t.stringLiteral(
          attr.name.namespace.name + ":" + attr.name.name.name
        );
      else property = t.stringLiteral(attr.name.name);

      if (attr.value.type === "JSXExpressionContainer")
        value = attr.value.expression;
      else if (attr.value.type === "JSXExpressionContainer")
        value = attr.value.expression;
      else value = attr.value;

      return t.objectProperty(property, value);
    });

    attrsObject.properties = attrsObject.properties.concat(mapProperties);
    return attrsObject;
  }

  function getChildren(path) {
    const childrenArrayExpression = t.arrayExpression([]);
    childrenArrayExpression.elements = path.node.children;

    return childrenArrayExpression;
  }

  const transformToComputedIfContainsObservables = (path) => {
    if (isWrappedInComputedFunc(path)) return;
    if (isWrappedInComputedShorthand(path)) return;
    if (isWrappedInConditionalStatement(path)) return;
    if (isWrappedInSetter(path)) return;

    if (
      path.parent.type === "VariableDeclarator" ||
      path.parent.type === "JSXExpressionContainer"
    ) {
      const propRefs = query.findNestedIdentifiers(path, isPropIdentifier);

      const observables = [
        ...query.findNestedObservables(path),
        ...propRefs,
      ].map((p) => p.node);

      if (observables.length) {
        const callee = t.memberExpression(
          t.identifier("PlaceholderJs"),
          t.identifier("compute")
        );

        const depArray = t.arrayExpression(observables);
        const arrowFunc = t.ArrowFunctionExpression([], path.node);
        const callExpression = t.callExpression(callee, [arrowFunc, depArray]);
        path.replaceWith(callExpression, path.node);
      }
    }
  };

  const transformPropGetter = (path) => {
    const callee = t.memberExpression(
      t.identifier("PlaceholderJs"),
      t.identifier("getPropValue")
    );

    const callExpression = t.callExpression(callee, [path.node]);
    path.replaceWith(callExpression);
  };

  function isPropIdentifier(path) {
    const component = query.findComponentRoot(path);
    if (!component) return;

    const params = query.getFunctionParams(component);
    if (!params || params.length === 0) return;

    const isMember = path.parentPath.type === "MemberExpression";
    const bindingName = isMember
      ? path.parentPath.node.object.name
      : path.node.name;

    const b = path.scope.getBinding(bindingName);
    if (!b) return;

    const isRef = b.referencePaths.find((rp) => rp === path);

    if (b.path.node.type === "ObjectPattern" && b.path.node === params[0]) {
      // prop is destructured within function param declaration
      if (!isRef) return;
      return true;
    } else {
      if (isMember) {
        // prop is accessed as a member of the param
        if (path.node.name === params[0].name) return;
        if (b.identifier.name !== params[0].name) return;
        return true;
      } else {
        // prop is destructured after param declaration, in the function body
        if (path.parent.type === "ObjectProperty") return;
        if (
          b.path.node.type === "VariableDeclarator" &&
          b.path.node.id.type === "ObjectPattern"
        ) {
          if (b.path.node.init.name === params[0].name) {
            return true;
          }
        }
      }
    }
  }

  const transformJSX = (path) => {
    var openingElement = path.node.openingElement;
    var tagName = openingElement.name.name;
    const isComponent = tagName[0] === tagName[0].toUpperCase();

    if (isComponent) {
      var args = [];

      args.push(t.stringLiteral(tagName));

      var attribs = t.objectExpression([]);

      args.push(attribs);

      const componentName = tagName.replace(/^Component_/, "");

      var reactIdentifier = t.identifier("PlaceholderJs");
      var createElementIdentifier = t.identifier("registerComponent");
      var callee = t.memberExpression(reactIdentifier, createElementIdentifier);
      var callExpression = t.callExpression(callee, [
        t.stringLiteral(componentName),
        t.identifier(tagName),
        getProperties(path),
      ]);

      path.replaceWith(callExpression, path.node);
    } else {
      const typePropery = t.objectProperty(
        t.stringLiteral("type"),
        t.stringLiteral(tagName)
      );
      const attributesProperty = t.objectProperty(
        t.stringLiteral("properties"),
        getProperties(path)
      );
      const childrenProperty = t.objectProperty(
        t.stringLiteral("children"),
        getChildren(path)
      );

      const objProperties = [typePropery, attributesProperty, childrenProperty];
      const object = t.objectExpression(objProperties);

      path.replaceWith(object, path.node);
    }
  };

  const getRoot = (path) => {
    if (path.parentPath) return getRoot(path.parentPath);
    return path;
  };

  const transformAssignment = (path) => {
    const assignTo = path.node.left.name;

    const observable = query.getObservableBinding(path, assignTo);
    if (!observable) return;

    if (observable.path.node.type !== "VariableDeclarator")
      throw new Error(
        "Observable cannot be set outside the component it was initialized in!"
      );

    path.replaceWith(
      t.callExpression(
        t.memberExpression(t.identifier(assignTo), t.identifier("set")),
        [path.node.right]
      ),
      path.node
    );
  };

  return {
    name: "custom-jsx-plugin",
    manipulateOptions: function manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("jsx");
    },
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name === "compute") {
          if (isWrappedInComputedFunc(path)) return;
          if (isWrappedInConditionalStatement(path)) return;
          if (placeholderJsMethodMatchesProperty(path.node, "conditional"))
            return;

          const propRefs = query.findNestedIdentifiers(path, isPropIdentifier);

          const observables = [
            ...query.findNestedObservables(path),
            ...propRefs,
          ].map((p) => p.node);

          if (observables.length) {
            const callee = t.memberExpression(
              t.identifier("PlaceholderJs"),
              t.identifier("compute")
            );

            const depArray = t.arrayExpression(observables);
            const arrowFunc = t.ArrowFunctionExpression(
              [],
              path.node.arguments[0]
            );
            const callExpression = t.callExpression(callee, [
              arrowFunc,
              depArray,
            ]);
            path.replaceWith(callExpression, path.node);
          }
        }
      },
      JSXExpressionContainer(path) {
        path.replaceWith(path.node.expression);
      },
      JSXText(path) {
        // remove Blank JSXText
        if (path.node.value.replace(/\n|\r\n|\s/gi, "").length === 0) {
          path.remove();
        } else {
          path.replaceWith(t.stringLiteral(path.node.value));
        }
      },
      JSXElement(path) {
        transformJSX(path);

        // if(isInComponentBody(path)) {}

        path.traverse({
          AssignmentExpression(path) {
            transformAssignment(path);
          },
        });

        const replaceExpressions = {
          ConditionalExpression: transformToComputedIfContainsObservables,
          BinaryExpression: transformToComputedIfContainsObservables,
          LogicalExpression: transformToComputedIfContainsObservables,
          TemplateLiteral: transformToComputedIfContainsObservables,
        };
        getRoot(path).traverse({
          ...replaceExpressions,
          Identifier(p) {
            const binding = query.getRootBoundNode(p, p.node.name);
            if (!binding) return;
            binding.path.traverse(replaceExpressions);
            binding.referencePaths.forEach((refPath) => {
              if (refPath !== p && shouldTransformObservable(refPath)) {
                const callee = t.memberExpression(
                  t.identifier(refPath.node.name),
                  t.identifier("value")
                );
                const methodCall = t.expressionStatement(callee);
                refPath.replaceWith(methodCall, refPath.node);
              }
            });
          },
        });

        getRoot(path).traverse({
          Identifier(p) {
            if (isPropIdentifier(p)) {
              if (isWrappedInPropertyValueGetter(p)) return;
              if (isInComputedDeps(p)) return;

              transformPropGetter(p);
            }
          },
        });
      },
      AssignmentExpression(path) {
        transformAssignment(path);
      },
    },
  };
};

module.exports = exports["default"];
