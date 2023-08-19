import Observable from "../entities/Observable";
import debounce from "../utils/debounce";

class Computed extends Observable {
  computeFn = () => { }

  dependencies = [];

  constructor(computeFn, dependencies = []) {
    super(null);

    this.computeFn = computeFn;
    this.dependencies = dependencies;

    this.initialize();
  }

  compute() {
    return  this.computeFn(...this.dependencies)
  }

  initialize() {
    this.dependencies.forEach((dep) => {
      if (dep instanceof Observable) {
        const unsub = dep.listen(() => {
          this.set(this.compute());
        });
        this.origin.events.onOnce("unmount", unsub)
      }
    });

    this.value = this.compute()
  }


  set(newValue) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.listeners.forEach((fn) => fn(newValue));
    }
  }

  cleanup() {
    this.computeFn = null;
    this.dependencies = null
  }
}

export default Computed;
