import core from "../core";
import batchInvoke from "../utils/batchInvoke";
import { uniqueId } from "../utils/misc";

class Observable {
  id = uniqueId();

  value = null;

  listeners = [];

  origin = null;

  batch = true;

  constructor(initialValue, global = false) {
    this.origin = core.registerObservable(this, global);

    this.value = initialValue;

    if (!global)
      this.origin.events.onOnce("unmount", () => {
        this.muteAll();
        this.origin = null;
        this.cleanup();
      });
  }

  set(newValue) {
    batchInvoke("observable", this.id, () => {
      if (this.value !== newValue) {
        this.value = newValue;
        [...this.listeners].forEach((fn) => fn(newValue));
      }
    });
  }

  listen(listener) {
    this.listeners.push(listener);

    return () => this.mute(listener);
  }

  mute(listener) {
    this.listeners = this.listeners.filter((ln) => ln !== listener);
  }

  muteAll() {
    this.listeners = [];
  }

  cleanup() {}
}

export default Observable;
