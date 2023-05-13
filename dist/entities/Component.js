import { mountNode, renderElement } from "../DOM/DOM";
import BaseMountableEntity from "./BaseMountableEntity";

class Component extends BaseMountableEntity {

    name = null;

    symbol = Symbol("component")

    ref = null;

    observables = []

    effects = []

    constructor(name) {
        super([]);

        this.name = name;

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
        this.ref = renderElement(componentFn(properties), () => { });
    }

    mount(parent) {
        this.events.dispatch("mount", parent, this.ref)
        mountNode(parent, this.ref)
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