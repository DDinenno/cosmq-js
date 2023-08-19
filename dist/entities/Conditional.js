import debounce from "../utils/debounce";
import BaseMountableEntity from "./BaseMountableEntity";
import Observable from "./Observable";
import { insertChildAtIndex } from "../DOM/utils";

class Conditional extends BaseMountableEntity {
  deps = [];

  conditions = [];

  condition = undefined;

  constructor(deps, conditions) {
    super(["beforeChange", "change", "render"]);

    this.conditions = conditions;
    this.deps = deps;
    this.condition = this.evaluate();

    const handleChange = debounce(() => {
      this.events.dispatch("beforeChange", {});
      const newCondition = this.evaluate();

      if (this.condition !== newCondition) {
        this.condition = newCondition;
        this.events.dispatch("change", this.getConfig());
      }
    });

    this.deps.forEach((dep) => {
      if (dep instanceof Observable) {
        const unsub = dep.listen(handleChange);
        this.events.onOnce("unmount", unsub);
      }
    });

    this.events.onOnce("unmount", () => {
      this.deps = [];
      this.conditions = [];
      this.condition = null;
    });
  }

  evaluate() {
    return this.conditions.findIndex(
      ({ __condition__: condition }) => !!condition()
    );
  }

  getConfig() {
    let config = null;

    if (this.condition !== -1) {
      config = this.conditions[this.condition].body();
    }

    this.events.dispatch("render", config);

    return config;
  }

  mount(parent, mountNode) {
    let config = this.getConfig();
    let domRef = config;
    const index = parent.childNodes.length;

    const unsub = this.events.on("change", (newConfig) => {
      const currentConfig = config;

      if (newConfig == null) {
        config = null;
        if (domRef) domRef.remove();
        domRef = null;
      } else {
        const prevDomRef = domRef;
        config = newConfig;
        domRef = config;

        if (currentConfig == null) {
          insertChildAtIndex(parent, domRef, index);
        } else {
          mountNode(parent, domRef, prevDomRef);
        }
      }
    });

    this.events.onOnce("unmount", unsub);

    mountNode(parent, domRef);
    this.events.dispatch("mount");
  }

  unmount() {
    this.events.dispatch("unmount");
  }
}

export default Conditional;
