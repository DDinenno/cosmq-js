import Observable from "./Observable";
import core from "../core";

class Effect {
  dependencies = [];

  origin = null;

  constructor(body, deps) {
    this.origin = core.registerEffect(this);

    body(...this.dependencies);

    deps.forEach((dep, index) => {
      if (dep instanceof Observable) {
        this.dependencies[index] = dep.value;
        const unsub = dep.listen((newValue) => {
          this.dependencies[index] = newValue;
          body(...this.dependencies);
        });

        this.origin.events.onOnce("unmount", unsub)
      } else this.dependencies[index] = dep;
    });


    this.origin.events.onOnce("unmount", () => {
      this.deps = []
      this.origin = null;
    })


  }
}


export default Effect;