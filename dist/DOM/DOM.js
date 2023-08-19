import Observable from "../entities/Observable";
import Conditional from "../entities/Conditional";
import Component from "../entities/Component";
import ObservableArray from "../entities/ObservableArray";
import { flattenChildren, insertChildAtIndex } from "./utils";
import batchInvoke from "../utils/batchInvoke";
import EventEmitter from "../events/EventEmitter";

export const eventEmitter = new EventEmitter(["unmount"])

const config = { childList: true, subtree: true };

  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList" && mutation.removedNodes.length) {
        const { removedNodes } = mutation;

        for (let i = 0; i < removedNodes.length; i++) {
          const node = removedNodes[i];


          eventEmitter.dispatch("unmount", node)
        }
      }
    }
  });

  observer.observe(document, config);

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
 const unsubscribe = eventEmitter.on("unmount", unmountedNode => {
  if(unmountedNode === node) {
    callback()
    unsubscribe()
  }
 })  
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
  if (typeof child.value === "object" && "ObservableArray" in child.value) {
    // const obsArray = new ObservableArray(child);
    // obsArray.renderChildren(parent, child, mountNode, renderElement);
    // const unsub = child.listen(() =>
    //   obsArray.renderChildren(parent, child, mountNode, renderElement)
    // );
    // observeNodeUnmount(parent, () => {
    //   unsub()
    //   obsArray.unmount()
    // });
  } else {
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
        let newRef = currentRef
        
          if (child.value instanceof Element) {
            newRef = child.value
            mountNode(parent, newRef, currentRef);
          } else if(typeof child.value === ("string" || "number"))  {

                  
            if(currentRef instanceof Text) {
              currentRef.data = child.value
            } else {
              newRef = new Text(child.value);
              mountNode(parent, newRef, currentRef);
            }
          } else {
            console.debug("Unhandled case", child.value)
          }
          
          // mountNode(parent, newRef, currentRef);
          currentRef = newRef;
      });
      observeNodeUnmount(parent, unsub);
    }
  }
}

function renderElement(_type, _properties, _children) {
  const type = _type ?? "div";
  const { key, ...properties } = _properties ?? {};
  const children = _children ?? [];

  const node = document.createElement(type, properties);


  // apply properties
  applyProperties(node, properties);

  let childrenArr = Array.isArray(children) ? children : [children]; // flattenChildren(children);

  // append children
  if (childrenArr && childrenArr.length)
    childrenArr.forEach((child, childIndex) => {
      if (typeof child === ("string" || "number")) {
        mountNode(node, new Text(child));
      } else if (child instanceof ObservableArray) {
        child.mount(node, mountNode, renderElement)
        observeNodeUnmount(node, () => child.unmount());

      } else if (child instanceof Observable) {
        handleRenderingObservableElement(child, node);
      } else if (child instanceof Component) {
        child.mount(node);
        mountNode(node, child.ref);
        observeNodeUnmount(node, () => child.unmount());
      } else if (child instanceof Conditional) {
        child.mount(node, mountNode);
        observeNodeUnmount(node, () => child.unmount());
      } else if (child instanceof Element) {
        mountNode(node, child);
      } else if (child == null) {
        // do nothing
      } else if (Array.isArray(child)) {
        child.forEach((c) => {
          if (c instanceof Element) {
            mountNode(node, c);
          } else {
            console.debug("unhandled case", c);
          }
        });
      } else {
        console.debug("unhandled case", child);
      }
    });

  return node;
}

function renderDOM(component, targetId = "root") {
  const target = document.getElementById(targetId);
  if (!target) throw new Error("target not found");

  requestAnimationFrame(() => {
    mountNode(target, component.ref);
  });
}

export { mountNode, applyProperties, renderElement, renderDOM };
