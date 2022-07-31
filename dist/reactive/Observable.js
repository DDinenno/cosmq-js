import core from "../core";
// import batchInvoke from "../utils/batchInvoke";

class Observable {
  #symbol;

  value = null;

  listeners = [];

  constructor(initialValue) {
    this.value = initialValue;
    this.#symbol = core.registerObservable(this);
  }

  set(newValue, symbol) {
    if (symbol !== this.#symbol) {
      console.error(
        "Observable.set cannot be called outside the component it was initialized in!"
      );
      return;
    }

    // batchInvoke(this, () => {
    if (this.value !== newValue) {
      this.value = newValue;
      this.listeners.forEach((fn) => fn(newValue, this.value));
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
