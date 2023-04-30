import core from "../core";
// import batchInvoke from "../utils/batchInvoke";

class Observable {
  value = null;

  listeners = [];

  constructor(initialValue) {
    this.value = initialValue;
    core.registerObservable(this);
  }

  set(newValue) {
    // TODO: fix batch invoke
    // batchInvoke(this, () => {
    if (this.value !== newValue) {
      this.value = newValue;
      this.listeners.forEach((fn) => fn(newValue));
    }
    // });
  }

  listen(listener) {
    this.listeners.push(listener);
  }

  mute(listener) {
    this.listeners = this.listeners.filter((ln) => ln !== listener);
  }
}

export default Observable;
