// import Conditional from "./entities/Conditional";
// import Component from "./entities/Component";
// import Computed from "./entities/Computed";
import EventEmitter from "./events/EventEmitter";

class Core {
  #registeringComponents = [];

  #components = {};

  observables = {};

  events = new EventEmitter([]);

  getComponentId() {
    this.currentId = this.currentId + 1;
    return this.currentId;
  }

  getComponentContext() {
    return this.#registeringComponents[this.#registeringComponents.length - 1];
  }

  registerEffect(instance) {
    const component = this.getComponentContext();
    if (component == null) {
      throw new Error("initializing effect after component was registered!");
    }

    component.addEffect(instance);

    return component;
  }

  registerComponent(instance) {
    const component = instance;

    this.#components[component.id] = component;
    this.#registeringComponents = this.#registeringComponents.concat(component);


    component.events.on("render", () => {
      this.#registeringComponents = this.#registeringComponents.filter(
        (c) => c.id !== component.id
      );
    })

    component.events.on("mount", () => { });

    component.events.onOnce("unmount", () => {
      delete this.#components[component.id];
    });

    return component;
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
        "initializing observable after component was registered!"
      );
    }

    return component;
  }
}



export default new Core();
