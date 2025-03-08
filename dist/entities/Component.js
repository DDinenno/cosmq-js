import core from "../core"
import BaseMountableEntity from "./BaseMountableEntity";

class Component extends BaseMountableEntity {

  name = null;

  symbol = Symbol("component")

  ref = null;

  observables = []

  effects = []

  constructor(name, componentFn, properties = {}) {
    super(["render"]);

    this.name = name;

    core.registerComponent(this)
    this.render(componentFn, properties)

    this.events.onOnce("unmount", () => {
      this.observables = []
      this.effects = []
    })
  }

  addObservable(observable) {
    this.observables.push(observable)
  }


  addEffect(effect) {
    this.effects.push(effect)
  }

  render(componentFn, properties) {
    this.ref = componentFn(properties)

    if (typeof this.ref === "function")
      this.ref = this.ref()

    this.events.dispatch("render")
  }

  mount(parent) {

    this.events.dispatch("mount", parent, this.ref)
  }

  unmount() {
    this.events.dispatch("unmount")
    if (this.ref) {
      this.ref.remove()
      this.ref = null;
    }
  }
}

export default Component
