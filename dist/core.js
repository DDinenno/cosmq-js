import Conditional from "./reactive/Conditional";
import { renderElement, mountNode } from "./DOM";
import Observable from "./reactive/Observable";

class Core {
  #registeringComponents = [];

  #components = {};

  currentId = 0;

  observables = {};

  evalObservable(arg) {
    if (arg instanceof Observable === false)
      throw new Error("This is not an Observable!");

    return arg;
  }

  getComponentId() {
    this.currentId = this.currentId + 1;
    return this.currentId;
  }

  getComponentContext() {
    return this.#registeringComponents[this.#registeringComponents.length - 1];
  }

  registerObservable(instance) {
    const componentNode = this.getComponentContext();

    if (componentNode == null) {
      throw new Error(
        "initializing observable after component was registered!"
      );
    }

    componentNode.observables.push(instance);

    return componentNode.symbol;
  }

  registerComponent(name, component, properties = {}) {
    const id = `${name}[${this.getComponentId()}]`;

    const componentNode = {
      id,
      name,
      symbol: Symbol("component"),
      observables: [],
      isComponent: true,
      ref: null,
    };

    this.#components[id] = componentNode;
    this.#registeringComponents =
      this.#registeringComponents.concat(componentNode);

    let currentDomRef = null;
    const renderConfig = component(properties);

    let unmountFns = [];
    const onUnmount = (fn) => unmountFns.push(fn);
    const triggerOnUnMountFns = () => {
      unmountFns.forEach((fn) => fn());
      unmountFns = [];
    };

    if (renderConfig instanceof Conditional) {
      renderConfig.onChange((newConfig) => {
        const parentNode = currentDomRef?.parentNode;

        triggerOnUnMountFns();
        const newDomRef = renderElement(newConfig, onUnmount);

        mountNode(parentNode, newDomRef, currentDomRef);
        console.log("changed", name);
        currentDomRef = newDomRef;
      });
    }

    const config =
      renderConfig instanceof Conditional
        ? renderConfig.evaluate()
        : renderConfig;

    const domRef = renderElement(config, onUnmount);
    componentNode.ref = domRef;
    domRef.classList.add(`component-${id}`);

    this.#registeringComponents = this.#registeringComponents.filter(
      (c) => c.id !== id
    );

    return componentNode;
  }
}

export default new Core();