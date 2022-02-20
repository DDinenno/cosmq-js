import Conditional from "./reactive/Conditional"
import { renderElement, mountNode } from "./DOM"

function registerComponent(component, properties = {}) {
    const { name, deps, render: renderConfig } = component(properties);
  
    let unmountFns = [];
    const onUnmount = (fn) => unmountFns.push(fn);
    const triggerOnUnMountFns = () => {
      unmountFns.forEach((fn) => fn());
      unmountFns = [];
    };
  
    const ref = { current: null };
  
    if (renderConfig instanceof Conditional) {
      renderConfig.onChange((newConfig) => {
        const { domRef: currentDomRef, config: currentConfig } =
          ref.current || {};
  
        const parent = currentDomRef?.parentNode;
  
        if (newConfig !== currentConfig) {
          triggerOnUnMountFns();
          const newDomRef = renderElement(newConfig, onUnmount);
  
          // console.log(
          //   "on change",
          //   parent,
          //   newDomRef,
          //   currentDomRef
          //   // domRef === newDomRef
          // );
  
          mountNode(parent, newDomRef, currentDomRef);
          ref.current = { config: newConfig, domRef: newDomRef };
        }
      });
    }
  
    const render = () => {
    //  console.time("render: " + name);
    //  console.log("render", name);
      const { domRef: currentDomRef, config: currentConfig } = ref.current || {};
  
      const parentNode = currentDomRef?.parentNode;
      const config =
        renderConfig instanceof Conditional
          ? renderConfig.evaluate()
          : renderConfig();
  
      const domRef = renderElement(config, onUnmount);
      ref.current = { config, domRef };
  
      mountNode(parentNode, domRef, currentDomRef);
     console.timeEnd("render: " + name);
      return domRef;
    };
  
    return {
      component: name,
      deps,
      render,
      isMounted: false,
      isComponent: true,
    };
  }
  

export default registerComponent