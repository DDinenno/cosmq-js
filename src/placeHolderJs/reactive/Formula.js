
import Observable from "./Observable"

class Formula extends Observable {
    dependencies = [];
  
    constructor(generate, deps = []) {
      super();
      console.log(deps, typeof deps)
      deps.forEach((dep, index) => {
        if (dep instanceof Observable) {
          this.dependencies[index] = dep.value;
          dep.listen((newValue) => {
            this.dependencies[index] = newValue;
            this.set(generate(...this.dependencies));
          });
        } else this.dependencies[index] = dep;
      });
  
      this.value = generate(...this.dependencies);
    }
  }

  export default Formula


  function isWrappedInComputed(path) {
    if(path.parent) {
      if(path.parent.type === "CallExpression" &&  path.parentPath.node.callee.object === "PlaceholderJs") {
       return true;
      }      
    }

    return isWrappedInComputed(path.parentPath)
  }
