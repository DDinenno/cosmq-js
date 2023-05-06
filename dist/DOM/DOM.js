import Observable from "../reactive/Observable";
import Conditional from "../reactive/Conditional";
import { flattenChildren } from "./utils";

function mountNode(parent, newNode, oldNode = null, index) {
  if (!parent) {
    throw new Error("No parent provided!");
  }

  if (!newNode) {
    throw new Error("attempting to mount node that's null");
  }

  console.log(newNode, oldNode);
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

function insertChildAtIndex(parent, child, index) {
  if (!index) index = 0;
  if (index >= parent.childNodes.length) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, parent.childNodes[index]);
  }
}

function handleRenderingObservableElement(child, parent, mountNode, onUnmount) {
  if (Array.isArray(child.value)) {
    handleObservableArray(child, parent, onUnmount);
  } else {
    const unmountHandler = (fn) => {
      onUnmount(child.mute);
      onUnmount(fn);
    };

    if (parent.localName === "input") {
      applyProperties(parent, { value: child.value }, unmountHandler);

      child.listen(() => {
        applyProperties(parent, { value: child.value }, unmountHandler);
      });
    } else {
      let currentRef = new Text(child.value);

      mountNode(parent, currentRef);

      child.listen(() => {
        let newRef = new Text(child.value);
        mountNode(parent, newRef, currentRef);
        currentRef = newRef;
      });
    }
  }
}

function handleRenderConditionalStatement(child, parent, mountNode, onUnmount) {
  let config = child.getConfig();
  let domRef = renderElement(config, onUnmount);

  const index = parent.childNodes.length;

  child.onChange((newConfig) => {
    const currentConfig = config;

    if (newConfig == null) {
      // config = null;
      if (domRef) domRef.remove();
      domRef = null;
    } else {
      const prevDomRef = domRef;
      config = newConfig;
      domRef = renderElement(config, onUnmount);

      if (currentConfig == null) {
        insertChildAtIndex(parent, domRef, index);
      } else {
        mountNode(parent, domRef, prevDomRef);
      }
    }
  });

  mountNode(parent, domRef);
}

function renderElement(tree, onUnmount) {
  const { type = "null", properties = {}, children = [] } = tree || {};
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
        handleRenderingObservableElement(child, node, mountNode, onUnmount);
      } else if (child.isComponent) {
        mountNode(node, child.ref);
      } else if (child instanceof Conditional) {
        handleRenderConditionalStatement(child, node, mountNode, onUnmount);
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
