import Observable from "./reactive/Observable";
import Conditional from "./reactive/Conditional";

// https://stackoverflow.com/questions/5882768/how-to-append-a-childnode-to-a-specific-position
Element.prototype.insertChildAtIndex = function (child, index) {
  if (!index) index = 0;
  if (index >= this.children.length) {
    this.appendChild(child);
  } else {
    this.insertBefore(child, this.children[index]);
  }
};

function mountNode(parent, newNode, oldNode = null, index) {
  if (!parent) {
    throw new Error("No parent provided!");
  }

  if (!newNode) {
    throw new Error("attempting to mount node that's null");
  }

  if (!oldNode) {
    parent.appendChild(newNode);
  } else parent.replaceChild(newNode, oldNode);
}

function applyProperties(node, properties, onUnmount) {
  Object.entries(properties).forEach(([property, value]) => {
    if (property === "key") {
      node.dataset.key = value;
    } else if (property === "style") {
      applyProperties(node.style, value, onUnmount);
    } else if (property === "innerHTML") {
      node.append(value);
    } else {
      if (value instanceof Observable) {
        const observable = value;

        // set property
        node[property] = observable.value;

        // listen and update property if changes occur
        const listenerFN = (val) => {
          if (property === "innerHTML") {
            const childNodes = [...node.childNodes];
            node[property] = val;

            childNodes.forEach((child) => {
              if (child instanceof Element) node.appendChild(child);
            });
          } else {
            node[property] = val;
          }
        };
        observable.listen(listenerFN);
        onUnmount(() => observable.mute(listenerFN));
      } else if (property.match(/^handle:/)) {
        const eventName = property.replace(/^handle:/, "");
        node.addEventListener(eventName, value);
        onUnmount(() => node.removeEventListener(eventName, value));
      } else {
        node[property] = value;
      }
    }
  });
}

function flattenChildren(children) {
  const flattenedArray = [];
  const array = Array.isArray(children)
    ? children
    : (children && [children]) || [];

  array.forEach((child) => {
    if (Array.isArray(child)) flattenedArray.push(...child);
    return flattenedArray.push(child);
  });

  return flattenedArray;
}

function handleObservableArray(observable, parentNode, onUnmount) {
  const context = {
    config: null,
    domRef: null,
    keys: [],
    children: [],
    changed: false,
  };

  const getChildConfigs = () => {
    const newKeys = [];
    const children = observable.value || [];

    const { children: prevChildren, keys: prevKeys } = context;

    const foundKeys = [];
    const newChildren = children.map((childConfig, index) => {
      const { key } = childConfig.properties || {};
      if (key == null) throw new Error("Array items must have a key");
      if (foundKeys.includes(key))
        throw new Error("Found a duplicate key in child array!");
      foundKeys.push(key);

      newKeys.push(key);

      if (prevKeys[index] === key) {
        return prevChildren[index];
      } else {
        context.changed = true;
        return renderElement(childConfig, onUnmount);
      }
    });

    if (prevChildren.length !== newChildren.length) {
      context.changed = true;
    }

    context.keys = newKeys;
    context.children = newChildren;

    return newChildren;
  };

  const renderChildren = (newValue) => {
    const children = getChildConfigs();

    if (context.changed) {
      if (!context.domRef) {
        context.domRef = renderElement(
          {
            type: "div",
            properties: {},
            children: [],
          },
          onUnmount
        );
        mountNode(parentNode, context.domRef);
      }
    }

    const nodes = [...context.domRef.childNodes];
    const prevAmount = context.domRef.childNodes.length;

    if (children.length === 0) {
      for (let i = 0; i < nodes.length; i++) {
        context.domRef.removeChild(nodes[0]);
      }
    } else {
      children.forEach((child, index) => {
        if (nodes[index] === child) return;
        mountNode(context.domRef, child, nodes[index]);
      });

      if (children.length < nodes.length) {
        for (let i = children.length; i < nodes.length; i++) {
          context.domRef.childNodes[i].remove();
        }
      }
    }

    context.changed = false;
  };

  renderChildren(observable.value);
  observable.listen(renderChildren);
  onUnmount(observable.mute);
}

function renderElement(tree = {}, onUnmount) {
  const { type, properties = {}, children } = tree;
  const node = document.createElement(type, properties);

  // apply properties
  applyProperties(node, properties, onUnmount);

  let childrenArr = flattenChildren(children);

  // append children
  if (childrenArr && childrenArr.length)
    childrenArr.forEach((child, childIndex) => {
      if (typeof child === "string") {
        applyProperties(node, { innerHTML: child }, onUnmount);
      } else if (child instanceof Observable) {
        if (Array.isArray(child.value)) {
          handleObservableArray(child, node, onUnmount);
        } else {
          const unmountHandler = (fn) => {
            onUnmount(child.mute);
            onUnmount(fn);
          };

          if (node.localName === "input") {
            applyProperties(node, { value: child.value }, unmountHandler);

            child.listen(() => {
              applyProperties(node, { value: child.value }, unmountHandler);
            });
          } else {
            let currentRef = new Text(child.value);

            mountNode(node, currentRef);

            child.listen(() => {
              let newRef = new Text(child.value);
              mountNode(node, newRef, currentRef);
              currentRef = newRef;
            });
          }
        }
      } else if (child.isComponent) {
        mountNode(node, child.ref);
      } else if (child instanceof Conditional) {
        const context = {};

        context.config = child.evaluate();
        context.domRef = renderElement(context.config, onUnmount);

        child.onChange((newConfig) => {
          const { domRef: currentDomRef, config: currentConfig } =
            context || {};

          const parent = currentDomRef?.parentNode;

          if (newConfig !== currentConfig) {
            const newDomRef = renderElement(newConfig, onUnmount);

            context.config = newConfig;
            context.domRef = newDomRef;

            mountNode(parent, newDomRef, currentDomRef);
          }
        });

        mountNode(node, context.domRef);
      } else {
        mountNode(node, renderElement(child, onUnmount));
      }
    });

  return node;
}

function renderDOM(component, targetId = "root") {
  const target = document.getElementById(targetId);
  if (!target) throw new Error("target not found");
  mountNode(target, component.ref);
}

export { mountNode, applyProperties, renderElement, renderDOM };
