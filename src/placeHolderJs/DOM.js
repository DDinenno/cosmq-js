import registerComponent from "./registerComponent"
import Observable from "./reactive/Observable"
import Conditional from "./reactive/Conditional"

function mountNode(parent, newNode, oldNode = null) {
    //  console.log("mount node", newNode, "to", parent);
  if (!parent) {
    console.warn("no parent");
    return;
  }

  if (!newNode) {
    console.warn("attempting to mount node that's null");
    return;
  }

  // if theres no oldNode mount to parent
  if (!oldNode) parent.appendChild(newNode);
  // otherwise replace node with new node
  else {
  //  console.log(newNode === oldNode);
    parent.replaceChild(newNode, oldNode);
  }
}

function applyProperties(node, properties, onUnmount) {
    Object.entries(properties).forEach(([property, value]) => {
      if (property === "style") {
        applyProperties(node.style, value, onUnmount);
      } else {
        if (value instanceof Observable) {
          
          const observable = value;
  
          // set property
          node[property] = observable.value;
  
          // listen and update property if changes occur
          const listenerFN = (val) => {
            if (property === "innerHTML") {
              const childNodes = [...node.childNodes];
              node[property] = val;
  
              childNodes.forEach((child) => {
                if (child instanceof Element) node.appendChild(child);
              });
            } else {
              node[property] = val;
            }
          };
          observable.listen(listenerFN);
          onUnmount(() => observable.mute(listenerFN));
          // onDeleteFns.push(() => observable.mute(listenerFN))
        } else if (property.match(/^handle:/)) {
          const eventName = property.replace(/^handle:/, "");
          node.addEventListener(eventName, value);
          onUnmount(() => node.removeEventListener(eventName, value));
        } else {
          node[property] = value;
        }
      }
    });
  }


function flattenChildren(children) {
  const flattenedArray = []
  const array = Array.isArray(children)
  ? children
  : (children && [children]) || [];

  
  array.forEach(child => {
    if(Array.isArray(child)) 
      flattenedArray.push(...child);
    return flattenedArray.push(child);
  })

  return flattenedArray
}

function handleObservableArray(observable, parentNode, onUnmount) {
  // loop through children
  // store keys
  // render

  // when changes
  // compare keys
  // render
  // mount 

  // const { properties: prevProperties } = previousChildren && previousChildren[childIndex] || {}
       
          
  // if(prevProperties && prevProperties.key != null &&  prevProperties.key === child.properties.key) {
  //   console.log("key matches", child.properties.key)
  //   mountNode(node, previousDomRef);
  // } else {
  //   mountNode(node, renderElement(child, onUnmount));
  // }

  const context = {
    config: null,
    domRef: null,
    keys: [],
    children: [],
    changed: false,
  }



  const getChildConfigs = () => {
    const newKeys = []
    const children = observable.value || []

    const { children: prevChildren, keys: prevKeys } = context

    const foundKeys = []
    const newChildren = children.map((childConfig,index) => {
      const { key } = childConfig.properties;
      if(key == null) throw new Error("Array items must have a key")
      if(foundKeys.includes(key)) throw new Error("Found a duplicate key in child array!")
      foundKeys.push(key)

      newKeys.push(key)
      if( prevKeys[index] === key) {
        return prevChildren[index]
      } else {
        context.changed = true;
        return renderElement(childConfig, onUnmount);
      }
    })

    if(prevChildren.length !== newChildren.length) {
      context.changed = true;
    }


    context.keys = newKeys;
    context.children = newChildren

    return newChildren;
  }



  const renderChildren = (newValue) => {
    const children = getChildConfigs();

    if( context.changed) {
       
      // const previous =  context.domRef;
      // context.domRef = renderElement({
      //   type: "div", properties: {}, children: []
      // }, onUnmount)
      // mountNode(parentNode,  context.domRef,  previous)
      
      if(!context.domRef) {
        context.domRef = renderElement({
            type: "div", properties: {}, children: []
        }, onUnmount)
        mountNode(parentNode,  context.domRef)
      }
      

      children.forEach((child, index) => {
        if(context.domRef.childNodes[index] === child) return;
        mountNode(context.domRef, child, context.domRef.childNodes[index]);
      })

      if(context.domRef.childNodes.length > children.length) {
        for (let i = children.length; i < context.domRef.childNodes.length; i++) {
          context.domRef.childNodes[i].remove()
        }
      }
    }

    context.changed = false;
    // const nodes 
    
    // const { domRef: currentDomRef, config: currentConfig } =
    // context || {};

    // const parent = currentDomRef?.parentNode;
    // const newConfig = { type, properties, children: child.value, previousChildren: currentConfig.children, previousDomRef: context.domRef };

    // const newDomRef = renderElement(newConfig, onUnmount);


    //   context.config = newConfig;
    //   context.domRef = newDomRef;
    
    //   if(child.key) {

    //   }

    //   mountNode(parent, newDomRef, currentDomRef);
  }

  renderChildren(observable.value)
  observable.listen(renderChildren)
  onUnmount(observable.mute)
}
      
      
function renderElement(tree = {}, onUnmount) {
  const { type, properties = {}, children, previousChildren, previousDomRef } = tree;
  const node = document.createElement(type, properties);

  // apply properties
  applyProperties(node, properties, onUnmount);

  let childrenArr = flattenChildren(children)


  // append children
  if (childrenArr && childrenArr.length)
    childrenArr.forEach((child, childIndex) => {

    //  console.log(child)
      if (type === "inner") {
        if (typeof child === "string") {
          applyProperties(node, { innerHTML: child }, onUnmount);
        } else if (child instanceof Observable) {
          applyProperties(node, { innerHTML: child }, onUnmount);
        }
      } else {
        if (typeof child === "string") {
          // mountNode(
          //   node,
          //   renderElement(
          //     { type: "inner", properties: {}, children: [child] },
          //     onUnmount
          //   )
          // );
          applyProperties(node, { innerHTML: child }, onUnmount);
        } else if (child instanceof Observable) {
          // console.log(child)
          // mountNode(
          //   node,
          //   renderElement(
          //     { type: "inner", properties: {}, children: [child] },
          //     onUnmount
          //   )
          // );

          //const { type, properties = {}, children } = tree;
       

          if(Array.isArray(child.value)  ) {
            handleObservableArray(child, node, onUnmount)

            // const context = {}


            // context.config = { type, properties, children: child.value}
            // context.domRef = renderElement(context.config, onUnmount);
            // mountNode(node, context.domRef);
            
            // child.listen(() => {
            //   const { domRef: currentDomRef, config: currentConfig } =
            //   context || {};
        
            //   const parent = currentDomRef?.parentNode;
            //  const newConfig = { type, properties, children: child.value, previousChildren: currentConfig.children, previousDomRef: context.domRef };
        
            //     const newDomRef = renderElement(newConfig, onUnmount);
        
         
            //     context.config = newConfig;
            //     context.domRef = newDomRef;
              
            //     if(child.key) {

            //     }

            //     mountNode(parent, newDomRef, currentDomRef);
              
            // })
            // onUnmount(child.mute)
          } else {
            const unmountHandler = (fn) => {
              onUnmount(child.mute)
              onUnmount(fn)
            }

            applyProperties(node, { innerHTML: child.value }, unmountHandler);

            child.listen(() => {
              applyProperties(node, { innerHTML: child.value }, unmountHandler);
            })
          }
        } else if (child.isComponent) {
          const component = child.render();
          mountNode(node, component);
        } else if (child instanceof Conditional) {
        //  console.log("is conditional", child)
          const context = {}

          context.config = child.evaluate();
          context.domRef = renderElement(context.config, onUnmount);


            child.onChange((newConfig) => {
              const { domRef: currentDomRef, config: currentConfig } =
              context || {};
        
              const parent = currentDomRef?.parentNode;
        
              if (newConfig !== currentConfig) {
                // triggerOnUnMountFns();
                const newDomRef = renderElement(newConfig, onUnmount);
        
                // console.log(
                //   "on change",
                //   parent,
                //   newDomRef,
                //   currentDomRef
                //   // domRef === newDomRef
                // );
                context.config = newConfig;
                context.domRef = newDomRef;

                mountNode(parent, newDomRef, currentDomRef);
              }
            });

            mountNode(node, context.domRef);
          }
        else {
          mountNode(node, renderElement(child, onUnmount));
        }
      }
    });

  // node.onDeleteNode = () =>  onDeleteFns.forEach(fn => fn())

  return node;
}


function renderDOM(component, targetId = "root") {
  const target = document.getElementById(targetId);
  if (!target) throw new Error("target not found");
  mountNode(target, registerComponent(component, {}).render());
}
      


export { mountNode, applyProperties, renderElement, renderDOM }