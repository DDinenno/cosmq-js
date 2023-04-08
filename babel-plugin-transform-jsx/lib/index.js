"use strict";

exports.__esModule = true;

exports.default = function (babel) {
  const { types: t } = babel;

  const variableDeclarations = [];

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
    childrenArrayExpression.elements = childrenArrayExpression.elements.concat(
      path.node.children
    );
    return childrenArrayExpression;
  }

  return {
    name: "custom-jsx-plugin",
    manipulateOptions: function manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("jsx");
    },
    visitor: {
      Declaration(path) {
        if (path.node.type === "FunctionDeclaration")
          variableDeclarations.push(path.node.id.name);
        if (path.node.type === "ImportDeclaration")
          path.node.specifiers.forEach((s) => {
            if (s.local.name) variableDeclarations.push(s.local.name);
          });
        if (path.node.type === "VariableDeclaration")
          path.node.declarations.forEach((d) => {
            if (d.id.name) variableDeclarations.push(d.id.name);
          });
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
        var openingElement = path.node.openingElement;
        var tagName = openingElement.name.name;
        const isComponent = variableDeclarations.includes(tagName);

        if (isComponent) {
          var args = [];

          args.push(t.stringLiteral(tagName));

          var attribs = t.objectExpression([]);

          args.push(attribs);

          var reactIdentifier = t.identifier("PlaceholderJs");
          var createElementIdentifier = t.identifier("registerComponent");
          var callee = t.memberExpression(
            reactIdentifier,
            createElementIdentifier
          );
          var callExpression = t.callExpression(callee, [
            t.stringLiteral(tagName),
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

          const objProperties = [
            typePropery,
            attributesProperty,
            childrenProperty,
          ];
          const object = t.objectExpression(objProperties);

          path.replaceWith(object, path.node);
        }
      },
    },
  };
};

module.exports = exports["default"];
