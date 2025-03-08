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

observer.observe(document, { childList: true, subtree: true });

function mountNode(parent, newNode, oldNode = null) {
  if (!parent) {
    throw new Error("No parent provided!");
  }

  if (!newNode) {
    throw new Error("attempting to mount node that's null");
  }

  const node = typeof newNode === "function" ? newNode(oldNode) : newNode;

  if (!oldNode) {
    parent.appendChild(node);
  } else if (oldNode && oldNode.parentNode === parent) {
    parent.replaceChild(node, oldNode);
  } else {
    parent.appendChild(node);
  }
  return node;
}

function observeNodeUnmount(node, callback) {
  // return;
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

    if (
      node.style[key] === value ||
      (value == null && node.style[key] === "")
    ) {
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
    } else if (property === "ref") {
      return value(node);
    } else if (property === "innerHTML") {
      if (node[property] === value) return;
      node.append(value);
    } else {
      if (value instanceof Observable) {
        const observable = value;

        if (node[property] === observable.value) return;

        // set property
        node[property] = observable.value ?? "";

        // listen and update property if changes occur
        const listenerFN = (val) => {
          if (property === "innerHTML") {
            const childNodes = [...node.childNodes];
            node[property] = val ?? "";

            childNodes.forEach((child) => {
              if (child instanceof Element) node.appendChild(child);
            });
          } else {
            node[property] = val ?? "";
          }
        };
        const unsub = observable.listen(listenerFN);
        observeNodeUnmount(parent, unsub);
      } else if (property.match(/^handle:/)) {
        const eventName = property.replace(/^handle:/, "");
        node.addEventListener(eventName, value);
        observeNodeUnmount(parent, () =>
          node.removeEventListener(eventName, value),
        );
      } else {
        if (node[property] === value) return;
        node[property] = value;
      }
    }
  });
}

function handleMountingComponent(child, parent, previous) {
  let ref = child.mount(parent);

  if (child.ref instanceof Element) {
    mountNode(parent, child.ref, previous);
  } else if (child.ref instanceof Observable) {
    handleRenderingObservableElement(child.ref, parent);
  } else if (child.ref instanceof Component) {
    renderChildren(parent, child.ref);
  } else {
    // this is to render children that are fed through a component
    renderChildren(parent, child.ref);
  }

  observeNodeUnmount(child, () => child.unmount());

  return ref;
}

function handleRenderingObservableElement(child, parent) {
  if (parent.localName === "input") {
    applyProperties(parent, { value: child.value });

    const unsub = child.listen(() => {
      applyProperties(parent, { value: child.value });
    });
    observeNodeUnmount(parent, unsub);
  } else {
    let currentRef;


    if (child.value instanceof Element) {
      currentRef = child.value;
    } else if (child.value instanceof Component) {
      currentRef = handleMountingComponent(child.value, parent, currentRef);
    } else if (typeof child.value === ("string" || "number")) {
      currentRef = new Text(child.value ?? "");
    } else if (typeof child.value === "function") {
      currentRef = child.value();
    } else {
      // console.log(typeof child.value === "function", child.value)
      currentRef = renderElement("span", { hidden: true });
      console.debug("Unhandled case", child.value);
    }
    mountNode(parent, currentRef ?? new Text(""));

    const unsub = child.listen(() => {
      let newRef = currentRef;

      if (child.value instanceof Element) {
        newRef = child.value ?? new Text("");
        mountNode(parent, newRef, currentRef);
      } else if (child.value instanceof Component) {
        // renderChildren(parent, child.value)
        newRef = handleMountingComponent(child.value, parent, currentRef);
      } else if (typeof child.value === "function") {
        newRef = child.value(currentRef);
        if (currentRef) {
          newRef = child.value(currentRef);
        } else {
          newRef = child.value();
        }
        mountNode(parent, newRef, currentRef);
      } else if (typeof child.value === ("string" || "number")) {
        if (currentRef instanceof Text) {
          currentRef.data = child.value;
        } else {
          newRef = new Text(child.value);
          mountNode(parent, newRef, currentRef);
        }
      } else {
        currentRef = renderElement("span", { hidden: true });
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

function renderChildren(parent, children) {
  let childrenArr = Array.isArray(children) ? children : [children];

  // append children
  childrenArr.flat().forEach((child, childIndex) => {
    const prevChild = parent.childNodes[childIndex];

    if (typeof child === ("string" || "number" || "boolean")) {
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

      if (child.ref instanceof Element) {
        mountNode(parent, child.ref);
      } else if (child.ref instanceof Observable) {
        handleRenderingObservableElement(child.ref, parent);
      } else if (child.ref instanceof Component) {
        renderChildren(parent, child.ref);
      } else {
        // this is to render children that are fed through a component
        renderChildren(parent, child.ref);
      }

      observeNodeUnmount(child, () => child.unmount());
    } else if (child instanceof Conditional) {
      child.mount(parent, mountNode, () =>
        renderElement("span", { hidden: true }),
      );
      observeNodeUnmount(parent, () => child.unmount());
    } else if (child instanceof Element) {
      mountNode(parent, child);
    } else if (child == null) {
      // render hidden element as a placeholder
      const node = renderElement("span", { hidden: true }, []);
      mountNode(parent, node);
    } else if (typeof child === "function") {
      if (prevChild) {
        child(prevChild);
      } else {
        mountNode(parent, child());
      }
    } else {
      console.debug("unhandled case", child);
    }
  });
}

function renderElement(_type, _properties, _children, previousNode) {
  const type = _type ?? "div";
  const { key, ...properties } = _properties ?? {};

  let node = null;

  if (previousNode && type === previousNode?.tagName?.toLowerCase()) {
    if (type === "input") {
      if (previousNode.type === properties.type) {
        node = previousNode;
      }
    } else {
      // node = previousNode;
    }
  }

  if (node == null) {
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
