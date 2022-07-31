import Observable from "./Observable";

class Formula extends Observable {
  dependencies = [];

  values = [];

  constructor(generate, deps = []) {
    super();

    this.values = this.dependencies.map((d) =>
      d instanceof Observable ? d.value : d
    );
    this.value = generate(...this.values);

    deps.forEach((dep, index) => {
      if (dep instanceof Observable) {
        this.dependencies[index] = dep;

        dep.listen(() => {
          this.values = [...this.values];
          this.values[index] = dep.value;
          this.set(generate(...this.values));
        });
      } else this.dependencies[index] = dep;
    });
  }

  set(newValue) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.listeners.forEach((fn) => fn(newValue, this.value));
    }
  }
}

export default Formula;
