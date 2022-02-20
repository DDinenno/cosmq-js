
class Observable {
    value = null;
  
    listeners = [];
  
    constructor(initialValue) {
      this.value = initialValue;
    }
  
    set(newValue) {
      if(this.value !== newValue) {
        this.value = newValue;
        this.listeners.forEach((fn) => fn(newValue));
      }
    }
  
    listen(listener) {
      this.listeners.push(listener);
    }
  
    mute(listener) {
      this.listeners = this.listeners.filter((ln) => ln !== listener);
    }
  }

  export default Observable