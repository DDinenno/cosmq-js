import Observable from "./Observable";

class Formula extends Observable {
  dependencies = [];

  values = [];

  constructor(generate, deps = []) {
    super();

    this.batch = false;
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
          console.log("generated",generate(...this.values))
          this.set(generate(...this.values));
        });
      } else this.dependencies[index] = dep;
    });
  }
}

export default Formula;
