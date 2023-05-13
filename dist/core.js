import Conditional from "./entities/Conditional";
import Observable from "./reactive/Observable";
import Component from "./entities/Component";
import EventEmitter from "./events/EventEmitter";

class Core {
  #registeringComponents = [];

  #components = {};

  observables = {};

  events = new EventEmitter([]);

  evalObservable(arg) {
    if (arg instanceof Observable === false)
      throw new Error("This is not an Observable!");

    return arg;
  }

  getComponentId() {
    this.currentId = this.currentId + 1;
    return this.currentId;
  }

  getPropValue(prop) {
    return prop instanceof Observable ? prop.value : prop;
  }

  getComponentContext() {
    return this.#registeringComponents[this.#registeringComponents.length - 1];
  }

  registerObservable(instance) {
    const component = this.getComponentContext();
    if (component == null) {
      throw new Error(
        "initializing observable after component was registered!"
      );
    }

    component.addObservable(instance);

    return component;
  }

  registerEffect(instance) {
    const component = this.getComponentContext();
    if (component == null) {
      throw new Error(
        "initializing effect after component was registered!"
      );
    }

    component.addEffect(instance);

    return component;
  }

  registerComponent(name, componentFn, properties = {}) {
    const component = new Component(name, properties, componentFn);

    this.#components[component.id] = component;
    this.#registeringComponents = this.#registeringComponents.concat(component);
    this.#lastRegisteredEntity = component

    component.render(componentFn, properties);
    this.#registeringComponents = this.#registeringComponents.filter(
      (c) => c.id !== component.id
    );


    component.events.on("mount", () => {
    })

    component.events.onOnce("unmount", () => {
      delete this.#components[component.id];
    });

    return component;
  }


}

export default new Core();
