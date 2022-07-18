import Observable from "./Observable";

class Conditional {
  deps = [];

  conditions = [];

  prevCondition = null;

  newCondition = null;

  config = null;

  onChange(cb) {
    this.deps.forEach((dep) =>
      dep.listen(() => {
        // re-evalute
        const previousConfig = this.config;
        const newConfig = this.evaluate();

        if (newConfig !== previousConfig) {
          cb(newConfig, previousConfig);
        }
      })
    );
  }

  constructor(deps, conditions) {
    this.conditions = conditions;
    this.deps = deps;
  }

  evaluate() {
    const matchedCondition = this.conditions.findIndex(({ condition }) => {
      const params = this.deps.map((dep) =>
        dep instanceof Observable ? dep.value : dep
      );
      return !!condition(...params);
    });

    if (matchedCondition !== -1 && matchedCondition !== this.prevCondition) {
      this.prevCondition = matchedCondition;
      this.config = this.conditions[matchedCondition].body();
      return this.config;
    }

    return this.config;
  }
}

export default Conditional;
