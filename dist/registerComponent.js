import Conditional from "./reactive/Conditional";
import { renderElement, mountNode } from "./DOM";

function registerComponent(component, properties = {}) {
  const { name, deps, render: renderConfig } = component(properties);
  let currentDomRef = null;

  let unmountFns = [];
  const onUnmount = (fn) => unmountFns.push(fn);
  const triggerOnUnMountFns = () => {
    unmountFns.forEach((fn) => fn());
    unmountFns = [];
  };

  if (renderConfig instanceof Conditional) {
    renderConfig.onChange((newConfig) => {
      const parent = currentDomRef?.parentNode;

      triggerOnUnMountFns();
      const newDomRef = renderElement(newConfig, onUnmount);

      mountNode(parent, newDomRef, currentDomRef);
      currentDomRef = newDomRef;
    });
  }

  const render = () => {
    const parentNode = currentDomRef?.parentNode;
    const config =
      renderConfig instanceof Conditional
        ? renderConfig.evaluate()
        : renderConfig();

    const domRef = renderElement(config, onUnmount);

    mountNode(parentNode, domRef, currentDomRef);
    currentDomRef = domRef;

    console.timeEnd("rendered component: " + name);

    return domRef;
  };

  return {
    component: name,
    deps,
    render,
    isComponent: true,
  };
}

export default registerComponent;
