import Observable from "./Observable";

class Computed extends Observable {
  dependencies = [];

  constructor(computeFn, dependencies = []) {
    super();

    this.dependencies = dependencies;


    this.dependencies.forEach((dep) => {
      if (dep instanceof Observable) {
        const unsub = dep.listen(() => {
          this.set(computeFn(...this.dependencies));
        });
        this.origin.events.onOnce("unmount", unsub)
      }
    });

    this.value = computeFn(...this.dependencies);
  }

  set(newValue) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.listeners.forEach((fn) => fn(newValue));
    }
  }
}

export default Computed;
