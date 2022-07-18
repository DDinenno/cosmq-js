import Observable from "./reactive/Observable"
import Conditional from "./reactive/Conditional"
import Formula from "./reactive/Formula"
import registerComponent from "./registerComponent"
import {  mountNode, applyProperties, renderElement, renderDOM } from "./DOM"

const observe =  (initialValue) => new Observable(initialValue)
const compute =   (body, deps = []) => new Formula(body, deps)
const effect =  (body, deps = []) => new Formula(body, deps)
const conditional = (deps, conditions) => new Conditional(deps, conditions)



const PlaceHolderJs = {
    Observable,
 observe,
 compute,
 effect,
 conditional,
 registerComponent,
 mountNode, 
 applyProperties, 
 renderElement, 
 renderDOM
}

export default PlaceHolderJs 
export {
    observe,
    compute,
    effect,
    conditional,
    registerComponent,
    mountNode, 
    applyProperties, 
    renderElement, 
    renderDOM
}
  
