import Observable from "../entities/Observable";
import batchInvoke from "../utils/batchInvoke";
import core from "../core";

class Computed extends Observable {
  computeFn = () => {};

  dependencies = [];

  invoking = false;

  destroyed = false;

  constructor(computeFn, dependencies = []) {
    super(null);

    this.computeFn = computeFn;
    this.dependencies = dependencies.filter((d) => d instanceof Observable);
    if (typeof computeFn != "function")
      throw new Error("compute not a function!");

    if (!Array.isArray(dependencies))
      throw new Error("Missing dependency Array!");

    this.initialize();
  }

  compute(batch = true) {
    if (batch) {
      batchInvoke("compute", this.id, () => {
        core.observableRender(this.origin, () => {
          const value = this.computeFn(...this.dependencies);
          this.set(value);
        });
      });
    } else {
      core.observableRender(this.origin, () => {
        const value = this.computeFn(...this.dependencies);
        this.set(value);
      });
    }
  }

  initialize() {
    this.dependencies.forEach((dep) => {
      if (dep instanceof Observable) {
        const isComputed = dep instanceof Computed;

        const unsub = dep.listen(() => {
          this.compute(!isComputed);
        });
        this.origin.events.onOnce("unmount", unsub);
      }
    });

    this.value = this.computeFn(...this.dependencies);
  }

  set(newValue) {
    if (this.value !== newValue) {
      this.value = newValue;
      [...this.listeners].forEach((fn) => fn(newValue));
    }
  }

  cleanup() {
    this.computeFn = null;
    this.dependencies = null;
  }
}

export default Computed;
