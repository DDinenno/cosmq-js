import Observable from "./Observable"

class Effect {
    listeners = [];
  
    dependencies = [];
  
    constructor(body, deps) {
      deps.forEach((dep, index) => {
        if (dep instanceof Observable) {
          this.dependencies[index] = dep.value;
          dep.listen((newValue) => {
            this.dependencies[index] = newValue;
            body(...this.dependencies);
          });
        } else this.dependencies[index] = dep;
      });
  
      body(...this.dependencies);
    }
  
    listen(listener) {
      this.listeners.push(listener);
    }
  
    mute(listener) {
      this.listeners = this.listeners.filter((ln) => ln !== listener);
    }
  }

  
  export default Effect;