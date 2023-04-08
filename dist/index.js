import Observable from "./reactive/Observable";
import Conditional from "./reactive/Conditional";
import Formula from "./reactive/Formula";
import core from "./core";
import { mountNode, applyProperties, renderElement, renderDOM } from "./DOM";

const observe = (initialValue) => new Observable(initialValue);
const compute = (body, deps = []) => new Formula(body, deps);
const effect = (body, deps = []) => new Formula(body, deps);
const conditional = (deps, conditions) => new Conditional(deps, conditions);

const registerComponent = core.registerComponent.bind(core);
const getComponentContext = core.getComponentContext.bind(core);
const evalObservable = core.evalObservable.bind(core);

const PlaceholderJs = {
  observe,
  compute,
  effect,
  conditional,
  registerComponent,
  getComponentContext,
  evalObservable,
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
  mountNode,
  applyProperties,
  renderElement,
  renderDOM,
};
