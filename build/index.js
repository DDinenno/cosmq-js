/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/component1.js":
/*!***************************!*\
  !*** ./src/component1.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _placeHolderJs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./placeHolderJs */ "./src/placeHolderJs/index.js");


const Component1 = (_ref) => {
  let {
    testObs
  } = _ref;
  const items = new _placeHolderJs__WEBPACK_IMPORTED_MODULE_0__.default.Observable([]);
  const text = new _placeHolderJs__WEBPACK_IMPORTED_MODULE_0__.default.Observable("");
  console.log(testObs);
  _placeHolderJs__WEBPACK_IMPORTED_MODULE_0__.default.effect(() => {
    console.log(items.value, text.value, testObs);
  }, [items, text, testObs]);

  const handleInput = e => {
    text.set(testObs.value + 2);
  };

  const handleClick = () => {
    items.set(items.value.concat({
      id: Math.random() * 100000,
      name: text.value
    }));
    text.set("");
  };

  testObs.set(testObs.value + 2);
  return {
    name: "component 1",
    render: () => ({
      "type": "div",
      "properties": {
        "style": {
          width: "100%",
          height: "100%",
          padding: "20px",
          boxSizing: "border-box",
          border: "solid 2px #3bc3bc",
          background: "maroon"
        }
      },
      "children": [{
        "type": "h1",
        "properties": {
          "style": {
            color: "white",
            marginTop: "0px"
          }
        },
        "children": ["Todo"]
      }, {
        "type": "input",
        "properties": {
          "value": text,
          "handle:input": handleInput
        },
        "children": []
      }, {
        "type": "button",
        "properties": {
          "handle:click": handleClick
        },
        "children": ["Add Item"]
      }, _placeHolderJs__WEBPACK_IMPORTED_MODULE_0__.default.compute(() => items.value.map((item, i) => console.log(item) || {
        "type": "div",
        "properties": {
          "key": item.id,
          "style": {
            display: "flex",
            justifyContent: "space-between",
            userSelect: "none",
            width: "200px",
            padding: "5px",
            background: "#3bc3bc",
            border: "solid 1px #333",
            borderRadius: "5px",
            marginTop: "10px"
          }
        },
        "children": [{
          "type": "span",
          "properties": {},
          "children": ["(".concat(i, ")")]
        }, {
          "type": "span",
          "properties": {},
          "children": [item.name]
        }, {
          "type": "button",
          "properties": {
            "handle:click": () => {
              items.set(items.value.filter(filterItem => console.log(filterItem.id, item.id) || filterItem.id !== item.id));
            }
          },
          "children": ["\n                      X\n                    "]
        }]
      }), [items])]
    })
  };
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Component1);

/***/ }),

/***/ "./src/component2.js":
/*!***************************!*\
  !*** ./src/component2.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _placeHolderJs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./placeHolderJs */ "./src/placeHolderJs/index.js");
/* harmony import */ var _component1__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component1 */ "./src/component1.js");



const Component2 = () => {
  const testObs = new _placeHolderJs__WEBPACK_IMPORTED_MODULE_0__.default.Observable([]);
  return {
    name: "component 2",
    render: () => ({
      "type": "div",
      "properties": {},
      "children": [_placeHolderJs__WEBPACK_IMPORTED_MODULE_0__.default.registerComponent(_component1__WEBPACK_IMPORTED_MODULE_1__.default, {
        "testObs": testObs
      }, [])]
    })
  };
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Component2);

/***/ }),

/***/ "./src/placeHolderJs/DOM.js":
/*!**********************************!*\
  !*** ./src/placeHolderJs/DOM.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mountNode": () => (/* binding */ mountNode),
/* harmony export */   "applyProperties": () => (/* binding */ applyProperties),
/* harmony export */   "renderElement": () => (/* binding */ renderElement),
/* harmony export */   "renderDOM": () => (/* binding */ renderDOM)
/* harmony export */ });
/* harmony import */ var _registerComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./registerComponent */ "./src/placeHolderJs/registerComponent.js");
/* harmony import */ var _reactive_Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reactive/Observable */ "./src/placeHolderJs/reactive/Observable.js");
/* harmony import */ var _reactive_Conditional__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./reactive/Conditional */ "./src/placeHolderJs/reactive/Conditional.js");




function mountNode(parent, newNode) {
  let oldNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  //  console.log("mount node", newNode, "to", parent);
  if (!parent) {
    console.warn("no parent");
    return;
  }

  if (!newNode) {
    console.warn("attempting to mount node that's null");
    return;
  } // if theres no oldNode mount to parent


  if (!oldNode) parent.appendChild(newNode); // otherwise replace node with new node
  else {
      //  console.log(newNode === oldNode);
      parent.replaceChild(newNode, oldNode);
    }
}

function applyProperties(node, properties, onUnmount) {
  Object.entries(properties).forEach((_ref) => {
    let [property, value] = _ref;

    if (property === "style") {
      applyProperties(node.style, value, onUnmount);
    } else {
      if (value instanceof _reactive_Observable__WEBPACK_IMPORTED_MODULE_1__.default) {
        const observable = value; // set property

        node[property] = observable.value; // listen and update property if changes occur

        const listenerFN = val => {
          if (property === "innerHTML") {
            const childNodes = [...node.childNodes];
            node[property] = val;
            childNodes.forEach(child => {
              if (child instanceof Element) node.appendChild(child);
            });
          } else {
            node[property] = val;
          }
        };

        observable.listen(listenerFN);
        onUnmount(() => observable.mute(listenerFN)); // onDeleteFns.push(() => observable.mute(listenerFN))
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
  const flattenedArray = [];
  const array = Array.isArray(children) ? children : children && [children] || [];
  array.forEach(child => {
    if (Array.isArray(child)) flattenedArray.push(...child);
    return flattenedArray.push(child);
  });
  return flattenedArray;
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
    changed: false
  };

  const getChildConfigs = () => {
    const newKeys = [];
    const children = observable.value || [];
    const {
      children: prevChildren,
      keys: prevKeys
    } = context;
    const foundKeys = [];
    const newChildren = children.map((childConfig, index) => {
      const {
        key
      } = childConfig.properties;
      if (key == null) throw new Error("Array items must have a key");
      if (foundKeys.includes(key)) throw new Error("Found a duplicate key in child array!");
      foundKeys.push(key);
      newKeys.push(key);

      if (prevKeys[index] === key) {
        return prevChildren[index];
      } else {
        context.changed = true;
        return renderElement(childConfig, onUnmount);
      }
    });

    if (prevChildren.length !== newChildren.length) {
      context.changed = true;
    }

    context.keys = newKeys;
    context.children = newChildren;
    return newChildren;
  };

  const renderChildren = newValue => {
    const children = getChildConfigs();

    if (context.changed) {
      // const previous =  context.domRef;
      // context.domRef = renderElement({
      //   type: "div", properties: {}, children: []
      // }, onUnmount)
      // mountNode(parentNode,  context.domRef,  previous)
      if (!context.domRef) {
        context.domRef = renderElement({
          type: "div",
          properties: {},
          children: []
        }, onUnmount);
        mountNode(parentNode, context.domRef);
      }

      children.forEach((child, index) => {
        if (context.domRef.childNodes[index] === child) return;
        mountNode(context.domRef, child, context.domRef.childNodes[index]);
      });

      if (context.domRef.childNodes.length > children.length) {
        for (let i = children.length; i < context.domRef.childNodes.length; i++) {
          context.domRef.childNodes[i].remove();
        }
      }
    }

    context.changed = false; // const nodes 
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
  };

  renderChildren(observable.value);
  observable.listen(renderChildren);
  onUnmount(observable.mute);
}

function renderElement() {
  let tree = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let onUnmount = arguments.length > 1 ? arguments[1] : undefined;
  const {
    type,
    properties = {},
    children,
    previousChildren,
    previousDomRef
  } = tree;
  const node = document.createElement(type, properties); // apply properties

  applyProperties(node, properties, onUnmount);
  let childrenArr = flattenChildren(children); // append children

  if (childrenArr && childrenArr.length) childrenArr.forEach((child, childIndex) => {
    //  console.log(child)
    if (type === "inner") {
      if (typeof child === "string") {
        applyProperties(node, {
          innerHTML: child
        }, onUnmount);
      } else if (child instanceof _reactive_Observable__WEBPACK_IMPORTED_MODULE_1__.default) {
        applyProperties(node, {
          innerHTML: child
        }, onUnmount);
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
        applyProperties(node, {
          innerHTML: child
        }, onUnmount);
      } else if (child instanceof _reactive_Observable__WEBPACK_IMPORTED_MODULE_1__.default) {
        // console.log(child)
        // mountNode(
        //   node,
        //   renderElement(
        //     { type: "inner", properties: {}, children: [child] },
        //     onUnmount
        //   )
        // );
        //const { type, properties = {}, children } = tree;
        if (Array.isArray(child.value)) {
          handleObservableArray(child, node, onUnmount); // const context = {}
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
          const unmountHandler = fn => {
            onUnmount(child.mute);
            onUnmount(fn);
          };

          applyProperties(node, {
            innerHTML: child.value
          }, unmountHandler);
          child.listen(() => {
            applyProperties(node, {
              innerHTML: child.value
            }, unmountHandler);
          });
        }
      } else if (child.isComponent) {
        const component = child.render();
        mountNode(node, component);
      } else if (child instanceof _reactive_Conditional__WEBPACK_IMPORTED_MODULE_2__.default) {
        //  console.log("is conditional", child)
        const context = {};
        context.config = child.evaluate();
        context.domRef = renderElement(context.config, onUnmount);
        child.onChange(newConfig => {
          const {
            domRef: currentDomRef,
            config: currentConfig
          } = context || {};
          const parent = currentDomRef === null || currentDomRef === void 0 ? void 0 : currentDomRef.parentNode;

          if (newConfig !== currentConfig) {
            // triggerOnUnMountFns();
            const newDomRef = renderElement(newConfig, onUnmount); // console.log(
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
      } else {
        mountNode(node, renderElement(child, onUnmount));
      }
    }
  }); // node.onDeleteNode = () =>  onDeleteFns.forEach(fn => fn())

  return node;
}

function renderDOM(component) {
  let targetId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "root";
  const target = document.getElementById(targetId);
  if (!target) throw new Error("target not found");
  mountNode(target, (0,_registerComponent__WEBPACK_IMPORTED_MODULE_0__.default)(component, {}).render());
}



/***/ }),

/***/ "./src/placeHolderJs/index.js":
/*!************************************!*\
  !*** ./src/placeHolderJs/index.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "observe": () => (/* binding */ observe),
/* harmony export */   "compute": () => (/* binding */ compute),
/* harmony export */   "effect": () => (/* binding */ effect),
/* harmony export */   "conditional": () => (/* binding */ conditional),
/* harmony export */   "registerComponent": () => (/* reexport safe */ _registerComponent__WEBPACK_IMPORTED_MODULE_3__.default),
/* harmony export */   "mountNode": () => (/* reexport safe */ _DOM__WEBPACK_IMPORTED_MODULE_4__.mountNode),
/* harmony export */   "applyProperties": () => (/* reexport safe */ _DOM__WEBPACK_IMPORTED_MODULE_4__.applyProperties),
/* harmony export */   "renderElement": () => (/* reexport safe */ _DOM__WEBPACK_IMPORTED_MODULE_4__.renderElement),
/* harmony export */   "renderDOM": () => (/* reexport safe */ _DOM__WEBPACK_IMPORTED_MODULE_4__.renderDOM)
/* harmony export */ });
/* harmony import */ var _reactive_Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reactive/Observable */ "./src/placeHolderJs/reactive/Observable.js");
/* harmony import */ var _reactive_Conditional__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reactive/Conditional */ "./src/placeHolderJs/reactive/Conditional.js");
/* harmony import */ var _reactive_Formula__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./reactive/Formula */ "./src/placeHolderJs/reactive/Formula.js");
/* harmony import */ var _registerComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./registerComponent */ "./src/placeHolderJs/registerComponent.js");
/* harmony import */ var _DOM__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./DOM */ "./src/placeHolderJs/DOM.js");






const observe = initialValue => new _reactive_Observable__WEBPACK_IMPORTED_MODULE_0__.default(initialValue);

const compute = function compute(body) {
  let deps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return new _reactive_Formula__WEBPACK_IMPORTED_MODULE_2__.default(body, deps);
};

const effect = function effect(body) {
  let deps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return new _reactive_Formula__WEBPACK_IMPORTED_MODULE_2__.default(body, deps);
};

const conditional = (deps, conditions) => new _reactive_Conditional__WEBPACK_IMPORTED_MODULE_1__.default(deps, conditions);

const PlaceHolderJs = {
  Observable: _reactive_Observable__WEBPACK_IMPORTED_MODULE_0__.default,
  observe,
  compute,
  effect,
  conditional,
  registerComponent: _registerComponent__WEBPACK_IMPORTED_MODULE_3__.default,
  mountNode: _DOM__WEBPACK_IMPORTED_MODULE_4__.mountNode,
  applyProperties: _DOM__WEBPACK_IMPORTED_MODULE_4__.applyProperties,
  renderElement: _DOM__WEBPACK_IMPORTED_MODULE_4__.renderElement,
  renderDOM: _DOM__WEBPACK_IMPORTED_MODULE_4__.renderDOM
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PlaceHolderJs);


/***/ }),

/***/ "./src/placeHolderJs/reactive/Conditional.js":
/*!***************************************************!*\
  !*** ./src/placeHolderJs/reactive/Conditional.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Observable */ "./src/placeHolderJs/reactive/Observable.js");


const listenToDeps = (cb, deps) => deps.forEach(dep => dep.listen(cb));

class Conditional {
  onChange(cb) {
    listenToDeps(() => {
      // re-evalute
      const previousConfig = this.config;
      const newConfig = this.evaluate();

      if (newConfig !== previousConfig) {
        //  console.log("conditional change");
        cb(newConfig);
      }
    }, this.deps);
  }

  constructor(deps, conditions) {
    this.deps = [];
    this.conditions = [];
    this.prevCondition = null;
    this.newCondition = null;
    this.config = null;
    this.conditions = conditions;
    this.deps = deps;
  }

  evaluate() {
    const matchedCondition = this.conditions.findIndex((_ref) => {
      let {
        condition
      } = _ref;
      const params = this.deps.map(dep => dep instanceof _Observable__WEBPACK_IMPORTED_MODULE_0__.default ? dep.value : dep);
      return !!condition(...params);
    });

    if (matchedCondition !== -1 && matchedCondition !== this.prevCondition) {
      this.prevCondition = matchedCondition;
      this.config = this.conditions[matchedCondition].body();
      return this.config;
    }

    return this.config;
  }

}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Conditional);

/***/ }),

/***/ "./src/placeHolderJs/reactive/Formula.js":
/*!***********************************************!*\
  !*** ./src/placeHolderJs/reactive/Formula.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Observable */ "./src/placeHolderJs/reactive/Observable.js");


class Formula extends _Observable__WEBPACK_IMPORTED_MODULE_0__.default {
  constructor(generate) {
    let deps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    super();
    this.dependencies = [];
    console.log(deps, typeof deps);
    deps.forEach((dep, index) => {
      if (dep instanceof _Observable__WEBPACK_IMPORTED_MODULE_0__.default) {
        this.dependencies[index] = dep.value;
        dep.listen(newValue => {
          this.dependencies[index] = newValue;
          this.set(generate(...this.dependencies));
        });
      } else this.dependencies[index] = dep;
    });
    this.value = generate(...this.dependencies);
  }

}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Formula);

function isWrappedInComputed(path) {
  if (path.parent) {
    if (path.parent.type === "CallExpression" && path.parentPath.node.callee.object === "PlaceholderJs") {
      return true;
    }
  }

  return isWrappedInComputed(path.parentPath);
}

/***/ }),

/***/ "./src/placeHolderJs/reactive/Observable.js":
/*!**************************************************!*\
  !*** ./src/placeHolderJs/reactive/Observable.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Observable {
  constructor(initialValue) {
    this.value = null;
    this.listeners = [];
    this.value = initialValue;
  }

  set(newValue) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.listeners.forEach(fn => fn(newValue));
    }
  }

  listen(listener) {
    this.listeners.push(listener);
  }

  mute(listener) {
    this.listeners = this.listeners.filter(ln => ln !== listener);
  }

}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Observable);

/***/ }),

/***/ "./src/placeHolderJs/registerComponent.js":
/*!************************************************!*\
  !*** ./src/placeHolderJs/registerComponent.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _reactive_Conditional__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reactive/Conditional */ "./src/placeHolderJs/reactive/Conditional.js");
/* harmony import */ var _DOM__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DOM */ "./src/placeHolderJs/DOM.js");



function registerComponent(component) {
  let properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    name,
    deps,
    render: renderConfig
  } = component(properties);
  let unmountFns = [];

  const onUnmount = fn => unmountFns.push(fn);

  const triggerOnUnMountFns = () => {
    unmountFns.forEach(fn => fn());
    unmountFns = [];
  };

  const ref = {
    current: null
  };

  if (renderConfig instanceof _reactive_Conditional__WEBPACK_IMPORTED_MODULE_0__.default) {
    renderConfig.onChange(newConfig => {
      const {
        domRef: currentDomRef,
        config: currentConfig
      } = ref.current || {};
      const parent = currentDomRef === null || currentDomRef === void 0 ? void 0 : currentDomRef.parentNode;

      if (newConfig !== currentConfig) {
        triggerOnUnMountFns();
        const newDomRef = (0,_DOM__WEBPACK_IMPORTED_MODULE_1__.renderElement)(newConfig, onUnmount); // console.log(
        //   "on change",
        //   parent,
        //   newDomRef,
        //   currentDomRef
        //   // domRef === newDomRef
        // );

        (0,_DOM__WEBPACK_IMPORTED_MODULE_1__.mountNode)(parent, newDomRef, currentDomRef);
        ref.current = {
          config: newConfig,
          domRef: newDomRef
        };
      }
    });
  }

  const render = () => {
    //  console.time("render: " + name);
    //  console.log("render", name);
    const {
      domRef: currentDomRef,
      config: currentConfig
    } = ref.current || {};
    const parentNode = currentDomRef === null || currentDomRef === void 0 ? void 0 : currentDomRef.parentNode;
    const config = renderConfig instanceof _reactive_Conditional__WEBPACK_IMPORTED_MODULE_0__.default ? renderConfig.evaluate() : renderConfig();
    const domRef = (0,_DOM__WEBPACK_IMPORTED_MODULE_1__.renderElement)(config, onUnmount);
    ref.current = {
      config,
      domRef
    };
    (0,_DOM__WEBPACK_IMPORTED_MODULE_1__.mountNode)(parentNode, domRef, currentDomRef);
    console.timeEnd("render: " + name);
    return domRef;
  };

  return {
    component: name,
    deps,
    render,
    isMounted: false,
    isComponent: true
  };
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (registerComponent);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _placeHolderJs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./placeHolderJs */ "./src/placeHolderJs/index.js");
/* harmony import */ var _component2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component2 */ "./src/component2.js");



const Item = (_ref) => {
  let {
    name,
    description
  } = _ref;
  return {
    name: "Item",
    render: () => ({
      "type": "div",
      "properties": {},
      "children": [name, " -", description]
    })
  };
};

const App = (_ref2) => {
  let {} = _ref2;
  return {
    name: "App",
    render: () => ({
      "type": "div",
      "properties": {
        "class": "app"
      },
      "children": [_placeHolderJs__WEBPACK_IMPORTED_MODULE_0__.default.registerComponent(_component2__WEBPACK_IMPORTED_MODULE_1__.default, {}, [])]
    })
  };
};

(0,_placeHolderJs__WEBPACK_IMPORTED_MODULE_0__.renderDOM)(App, "root");
})();

/******/ })()
;