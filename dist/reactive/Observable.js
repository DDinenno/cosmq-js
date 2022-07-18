class Observable {
  value = null;

  listeners = [];

  batch = true;

  static batchedCalls = {};

  static batchTimeout = null;

  constructor(initialValue) {
    this.value = initialValue;
  }

  static batchInvoke(callback) {
    Observable.batchedCalls[this] = callback;

    if (Observable.batchTimeout === null)
      Observable.batchTimeout = setTimeout(() => {
        Object.values(Observable.batchedCalls).forEach((callback) => callback());
        Observable.batchTimeout = null;
      }, 200);
  }

  set(newValue) {
    if (this.batch) {
      const batch = Observable.batchInvoke.bind(this);

      batch(() => {
        if (this.value !== newValue) {
          this.value = newValue;
          this.listeners.forEach((fn) => fn(newValue, this.value));
        }
      });
    } else {
      if (this.value !== newValue) {
        this.value = newValue;
        this.listeners.forEach((fn) => fn(newValue, this.value));
      }
    }
  }

  listen(listener) {
    this.listeners.push(listener);
  }

  mute(listener) {
    this.listeners = this.listeners.filter((ln) => ln !== listener);
  }
}

export default Observable;
