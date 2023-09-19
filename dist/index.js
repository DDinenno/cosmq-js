import Observable from "./entities/Observable";
import Computed from "./entities/Computed"
import Effect from "./entities/Effect"
import Conditional from "./entities/Conditional";
import core from "./core";
import {
  mountNode,
  applyProperties,
  renderElement,
  registerElement,
  renderDOM,
} from "./DOM/DOM";
import Component from "./entities/Component";
import ObservableArray from "./entities/ObservableArray";

const observe = (initialValue) => new Observable(initialValue);
const observableArray = (...args) => new ObservableArray(...args);
const compute = (body, deps = []) => new Computed(body, deps);
const effect = (body, deps = []) => new Effect(body, deps);
const conditional = (deps, conditions) => new Conditional(deps, conditions);
const registerComponent = (name, componentFn, properties) => new Component(name, componentFn, properties);

const getComponentContext = core.getComponentContext.bind(core);

const evalObservable = (arg) => {
  if (arg instanceof Observable === false)
    throw new Error("This is not an Observable!");

  return arg;
}

const getPropValue = prop => prop instanceof Observable ? prop.value : prop;

const Cosmq = {
  observe,
  observableArray,
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
  registerElement,
  renderDOM,
};

export default Cosmq;
export {
  observe,
  observableArray,
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
  registerElement,
  renderDOM,
};
