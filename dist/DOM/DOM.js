import Observable from "../entities/Observable";
import Conditional from "../entities/Conditional";
import Component from "../entities/Component";
import ObservableArray from "../entities/ObservableArray";
import EventEmitter from "../events/EventEmitter";

export const eventEmitter = new EventEmitter(["unmount"]);


const observer = new MutationObserver((mutationList) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList" && mutation.removedNodes.length) {
      const { removedNodes } = mutation;

      for (let i = 0; i < removedNodes.length; i++) {
        const node = removedNodes[i];

        eventEmitter.dispatch("unmount", node);
      }
    }
  }
});

observer.observe(document,  { childList: true, subtree: true });

function mountNode(parent, newNode, oldNode = null) {
  if (!parent) {
    throw new Error("No parent provided!");
  }

  if (!newNode) {
    throw new Error("attempting to mount node that's null");
  }

  if (!oldNode) {
    parent.appendChild(newNode);
  } else parent.replaceChild(newNode, oldNode);

  return newNode;
}

function observeNodeUnmount(node, callback) {
  const unsubscribe = eventEmitter.on("unmount", (unmountedNode) => {
    if (unmountedNode === node) {
      callback();
      unsubscribe();
    }
  });
}

function applyStyle(node, obj) {
  Object.entries(obj).forEach(([key, _value]) => {
    const value =
      typeof _value === ("string" || "number") ? String(_value) : _value;

    if (node.style[key] === value || (value == null && node.style[key] === "")) {
      return;
    }

    node.style[key] = value;
  });
}

function applyProperties(node, properties) {
  Object.entries(properties).forEach(([property, value]) => {
    if (property === "key") {
      node.dataset.key = value;
    } else if (property === "style") {
      applyStyle(node, value);
      applyProperties(node.style, value);
    } else if (property === "innerHTML") {
      if (node[property] === value) return;
      node.append(value);
    } else {
      if (value instanceof Observable) {
        const observable = value;
        if (node[property] === observable.value) return;

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
        const unsub = observable.listen(listenerFN);
        observeNodeUnmount(node, unsub);
      } else if (property.match(/^handle:/)) {
        const eventName = property.replace(/^handle:/, "");
        node.addEventListener(eventName, value);
        observeNodeUnmount(node, () =>
          node.removeEventListener(eventName, value)
        );
      } else {
        if (node[property] === value) return;
        node[property] = value;
      }
    }
  });
}

function handleRenderingObservableElement(child, parent) {
    if (parent.localName === "input") {
      applyProperties(parent, { value: child.value });

      const unsub = child.listen(() => {
        applyProperties(parent, { value: child.value });
      });
      observeNodeUnmount(parent, unsub);
    } else {
      let currentRef =
        child.value instanceof Element ? child.value : new Text(child.value);
      mountNode(parent, currentRef);

      const unsub = child.listen(() => {
        let newRef = currentRef;

        if (child.value instanceof Element) {
          newRef = child.value;
          mountNode(parent, newRef, currentRef);
        } else if (typeof child.value === ("string" || "number")) {
          if (currentRef instanceof Text) {
            currentRef.data = child.value;
          } else {
            newRef = new Text(child.value);
            mountNode(parent, newRef, currentRef);
          }
        } else {
          console.debug("Unhandled case", child.value);
        }

        currentRef = newRef;
      });
      observeNodeUnmount(parent, unsub);
    }
}

function registerElement(type, properties, children) {
  return (previousNode) =>
    renderElement(type, properties, children, previousNode);
}

function renderChildren(parent, children, indexOffset = 0) {
  let childrenArr = Array.isArray(children) ? children : [children];

  // append children
  childrenArr.forEach((child, i) => {
    const childIndex = i + indexOffset;

    const prevChild = parent.childNodes[childIndex];

    if (typeof child === ("string" || "number")) {
      if (prevChild instanceof Text) {
        if (prevChild.data !== String(child)) {
          prevChild.data = child;
        }
      } else mountNode(parent, new Text(child));
    } else if (child instanceof ObservableArray) {
      child.mount(parent, mountNode, renderElement);
      observeNodeUnmount(parent, () => child.unmount());
    } else if (child instanceof Observable) {
      handleRenderingObservableElement(child, parent);
    } else if (child instanceof Component) {
      child.mount(parent);
      mountNode(parent, child.ref);
      observeNodeUnmount(parent, () => child.unmount());
    } else if (child instanceof Conditional) {
      child.mount(parent, mountNode);
      observeNodeUnmount(parent, () => child.unmount());
    } else if (child instanceof Element) {
      mountNode(parent, child);
    } else if (child == null) {
      // do nothing
    } else if (Array.isArray(child)) {
      renderChildren(parent, child, indexOffset + childIndex);
    } else if (typeof child === "function") {
      if (prevChild) {
        child(prevChild);
      } else mountNode(parent, child(prevChild));
    }
    else {
      console.debug("unhandled case", child);
    }
  });
}

function renderElement(_type, _properties, _children, previousNode) {
  const type = _type ?? "div";
  const { key, ...properties } = _properties ?? {};

  let node = null;

  if (previousNode) {
    const previousTag = previousNode.tagName.toLowerCase()
    if (type === "input" && previousNode.type !== properties.type) {
      node = previousNode;
    } else if(type === previousTag) {
      node = previousNode;
    } else {
      node = document.createElement(type, properties);
    }
  } else {
    node = document.createElement(type, properties);
  }

  const children = _children ?? [];

  // apply properties
  applyProperties(node, properties);

  renderChildren(node, children);

  return node;
}

function renderDOM(component, targetId = "root") {
  const target = document.getElementById(targetId);
  if (!target) throw new Error("target not found");

  requestAnimationFrame(() => {
    mountNode(target, component.ref);
  });
}

export {
  mountNode,
  applyProperties,
  renderElement,
  registerElement,
  renderDOM,
};
