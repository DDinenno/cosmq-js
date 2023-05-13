import core from "../core";

class Observable {
  value = null;

  listeners = [];

  origin = null;

  constructor(initialValue) {
    this.origin = core.registerObservable(this);

    this.value = initialValue;

    this.origin.events.onOnce("unmount", () => {
      this.muteAll();
      this.origin = null;
    })

  }

  set(newValue) {
    // TODO: fix batch invoke
    if (this.value !== newValue) {
      this.value = newValue;
      [...this.listeners].forEach((fn) => fn(newValue));
    }
  }

  listen(listener) {
    this.listeners.push(listener);

    return () => this.mute(listener)
  }

  mute(listener) {
    this.listeners = this.listeners.filter((ln) => ln !== listener);
  }

  muteAll() {
    this.listeners = []
  }
}

export default Observable;
