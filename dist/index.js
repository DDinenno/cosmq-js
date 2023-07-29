import Observable from "./entities/Observable";
import Conditional from "./entities/Conditional";
import Computed from "./entities/Computed";
import core from "./core";
import {
  mountNode,
  applyProperties,
  renderElement,
  renderDOM,
} from "./DOM/DOM";

const observe = (initialValue) => new Observable(initialValue);
const compute = (body, deps = []) => new Computed(body, deps);
const effect = (body, deps = []) => new Computed(body, deps);
const conditional = (deps, conditions) => new Conditional(deps, conditions)

const registerComponent = core.registerComponent.bind(core);
const getComponentContext = core.getComponentContext.bind(core);
const evalObservable = core.evalObservable.bind(core);
const getPropValue = core.getPropValue.bind(core);

const PlaceholderJs = {
  observe,
  compute,
  effect,
  conditional,
  registerComponent,
  getComponentContext,
  evalObservable,
  getPropValue,
  mountNode,
  applyProperties,
  renderElement,
  renderDOM,
};

export default PlaceholderJs;
export {
  observe,
  compute,
  effect,
  conditional,
  evalObservable,
  registerComponent,
  getComponentContext,
  getPropValue,
  mountNode,
  applyProperties,
  renderElement,
  renderDOM,
};
