import Observable from "./Observable";

class Formula extends Observable {
  dependencies = [];

  constructor(computeFn, dependencies = []) {
    super();

    this.dependencies = dependencies;

    this.dependencies.forEach((dep, index) => {
      if (dep instanceof Observable) {
        dep.listen(() => {
          this.set(computeFn(...this.dependencies));
        });
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

export default Formula;
