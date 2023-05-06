import Observable from "./Observable";
import core from "../core";

class Conditional {
  deps = [];

  conditions = [];

  condition = undefined;

  onChange(cb) {
    this.deps.forEach((dep) => {
      if (dep instanceof Observable) {
        dep.listen(() => {
          // re-evalute
          const newCondition = this.evaluate();

          if (this.condition !== newCondition) {
            this.condition = newCondition;
            cb(this.getConfig());
          }
        });
      }
    });
  }

  constructor(deps, conditions) {
    this.conditions = conditions;
    this.deps = deps;
    this.condition = this.evaluate();
  }

  evaluate() {
    return this.conditions.findIndex(
      ({ __condition__: condition }) => !!condition()
    );
  }

  getConfig() {
    if (this.condition !== -1) {
      return this.conditions[this.condition].body();
    }

    return null;
  }
}

export default Conditional;
