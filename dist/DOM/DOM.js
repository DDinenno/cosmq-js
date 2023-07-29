import Observable from "../entities/Observable";
import Conditional from "../entities/Conditional";
import Component from "../entities/Component";
import ObservableArray from "../entities/ObservableArray"
import { flattenChildren, insertChildAtIndex } from "./utils";

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

  return newNode
}

function observeNodeUnmount(node, callback) {
  const config = { childList: true, subtree: true };

  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList" && mutation.removedNodes.length) {
        const { removedNodes } = mutation;

        for (let i = 0; i < removedNodes.length; i++) {
          const n = removedNodes[i];

          if (n === node || n.contains(node)) {
            observer.disconnect();
            callback();
            break;
          }
        }
      }
    }
  });

  observer.observe(document, config);
}

function applyProperties(node, properties) {
  Object.entries(properties).forEach(([property, value]) => {
    if (property === "key") {
      node.dataset.key = value;
    } else if (property === "style") {
      applyProperties(node.style, value);
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
        const unsub = observable.listen(listenerFN);
        observeNodeUnmount(node, unsub);
      } else if (property.match(/^handle:/)) {
        const eventName = property.replace(/^handle:/, "");
        node.addEventListener(eventName, value);
        observeNodeUnmount(node, () =>
          node.removeEventListener(eventName, value)
        );
      } else {
        node[property] = value;
      }
    }
  });
}


function handleRenderingObservableElement(child, parent) {
  if (Array.isArray(child.value)) {
    const obsArray = new ObservableArray(parent, child,)
    obsArray.renderChildren(parent, child)
    const unsub = child.listen(() => obsArray.renderChildren(parent, child));
    observeNodeUnmount(parent, unsub);
  } else {

    if (parent.localName === "input") {
      applyProperties(parent, { value: child.value });

      const unsub = child.listen(() => {
        applyProperties(parent, { value: child.value });
      });
      observeNodeUnmount(parent, unsub);
    } else {


      let currentRef = new Text(child.value);
      mountNode(parent, currentRef);

      const unsub = child.listen(() => {
        let newRef = new Text(child.value);
        mountNode(parent, newRef, currentRef);
        currentRef = newRef;
      });
      observeNodeUnmount(parent, unsub);
    }
  }
}

function renderElement(tree) {
  const { type = "null", properties = {}, children = [] } = tree || {};
  const node = document.createElement(type, properties);

  // apply properties
  applyProperties(node, properties);

  let childrenArr = flattenChildren(children);



  // append children
  if (childrenArr && childrenArr.length)
    childrenArr.forEach((child, childIndex) => {
      if (typeof child === "string") {
        mountNode(node, new Text(child))

      } else if (child instanceof Observable) {
        handleRenderingObservableElement(child, node);
      } else if (child instanceof Component) {
        child.mount(node);
        observeNodeUnmount(node, () => child.unmount());
      } else if (child instanceof Conditional) {
        child.mount(node);
        observeNodeUnmount(node, () => child.unmount());
      } else {
        mountNode(node, renderElement(child));
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
