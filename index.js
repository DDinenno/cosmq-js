"use strict";

var _placeHolderJs = _interopRequireWildcard(require("./placeHolderJs"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const getOptions = amount => {
  const arr = [];

  for (let i = 0; i < amount; i++) {
    arr.push({
      id: i + 1
    });
  }

  return arr;
}; // const Component1 = () => {
//   const a = new PlaceholderJs.Observable(2);
//   const b = PlaceholderJs.compute((a) => "#" + a, [a]);
//   return {
//     name: "component 1",
//     render: () => (
//       <div style={{
//         display: "block",
//         width: "100vw",
//         height: "100vh",
//         background: "red"
//       }}
//       handle:mousemove={(e) => {
//         a.set(Math.floor(e.clientY * 2));
//       } }
//       handle:click={() => {
//         a.set(a.value + 101);
//       }}
//        >
//         <div>{a}</div>
//          {PlaceholderJs.compute(() => {
//                return getOptions(a.value).map(item => (
//                <div key={item.id}>
//                  {`${item.id}-${a.value}`}
//                  <div key={item.id} style={{ padding: `${20 * 1 + item.id}px` }}>
//                    {`${item.id}-${a.value}`}
//                    <div key={item.id} style={{ padding: `${20 * 2 + item.id}px` }}>
//                      {`${item.id}-${a.value}`}
//                      </div>
//                    </div>
//                 </div>
//                ))
//              }, [a])}
//         {IF(a > 400)(
//            <div>
//              div 1
//              {/* {getOptions(a.value).map(item => <div>{`${item.id}-${a.value}`}</div>) */}
//             </div>
//         )}
//         {ELSE()(
//           <div>
//             <div> div 2</div>
//             <div>
//             {/* {getOptions(a.value * 3).map(item => <div>{`${item.id}-${a.value}`}</div>)} */}
//             </div>
//          </div>
//         )}
//       </div>
//     )
//   };
// };


const filler = amount => {
  const children = [];

  for (let i = 0; i < amount; i++) {
    children.push({
      "type": "div",
      "properties": {
        "style": {
          display: "flex",
          flexDirection: "column"
        }
      },
      "children": [{
        "type": "div",
        "properties": {
          "style": {
            background: "yellow"
          }
        },
        "children": ["one"]
      },
        /* <div style={{ background: "orange" }}>two</div>
        <div style={{ background: "cyan" }}>three</div> */
      ]
    });
  }

  return children;
};

const fillterRows = filler(25);

const Component1 = () => {
  const a = new _placeHolderJs.default.Observable(0);

  const b = _placeHolderJs.default.compute(f => 22 + f, _placeHolderJs.default.compute(() => [a.value])); // document.addEventListener("mousemove", (e) => {
  //   a.set(Math.floor(e.clientY / 18));
  // });


  const literal = "".concat(2 + 2);
  const computedTest = "".concat(a, " + ").concat(b);

  const computedTest2 = _placeHolderJs.default.compute(() => [a.value, 2, 5]);

  return {
    name: "component 1",
    render: () => ({
      "type": "div",
      "properties": {
        "style": {
          display: "block",
          width: "100vw",
          height: "100vh"
        },
        "handle:click": () => {
          a.set(b + a.value);
        },
        "handle:mousemove": e => {
          if (e.clientX > a.value + 10 || e.clientX < a.value - 10) {
            a.set(e.clientX);
          }
        }
      },
      "children": [{
        "type": "input",
        "properties": {
          "handle:input": e => {
            //  console.log("change",e)
            //  console.log(b.value)
            console.log(b.value + a.value);
            const value = parseInt(e.target.value, 10);
            console.log(a.value === a.value);

            if (isNaN(value)) {
              a.set(a.value + a.value - a.value / (a.value * a.value));
              return;
            }

            a.set(value);
          }
        },
        "children": []
      }, {
        "type": "div",
        "properties": {
          "style": {
            height: "400px",
            width: _placeHolderJs.default.compute(() => "".concat(a.value, "px"), _placeHolderJs.default.compute(() => [a.value])),
            overflow: "hidden"
          }
        },
        "children": [getOptions(100).map(item => ({
          "type": "div",
          "properties": {
            "key": item.id,
            "style": {
              display: "flex"
            }
          },
          "children": ["".concat(item.id, "-"), {
            "type": "div",
            "properties": {
              "style": {
                display: "flex",
                flexDirection: "row"
              }
            },
            "children": [fillterRows]
          }]
        }))]
      }, {
        "type": "div",
        "properties": {
          "style": {
            height: "400px",
            width: _placeHolderJs.default.compute(() => "".concat(a.value, "px"), _placeHolderJs.default.compute(() => [a.value])),
            overflow: "hidden"
          }
        },
        "children": [getOptions(100).map(item => ({
          "type": "div",
          "properties": {
            "key": item.id,
            "style": {
              display: "flex"
            }
          },
          "children": ["".concat(item.id, "-"), {
            "type": "div",
            "properties": {
              "style": {
                display: "flex",
                flexDirection: "row"
              }
            },
            "children": [fillterRows]
          }]
        }))]
      },
        /* {IF(a < 5000)(
         <div style={{ background: "red" }}>
           {PlaceholderJs.compute(() => {
             return getOptions(a.value).map((item) => (
               <div key={item.id} style={{ display: "flex" }}>
                 {`${item.id}-`}
                 <div style={{ display: "flex", flexDirection: "row" }}>
                   {fillterRows}
                 </div>
               </div>
             ));
           }, [a])}
         </div>
        )}
        {ELSE()(
         <div style={{ background: "cyan" }}>
           <div> div 2</div>
           <div></div>
         </div>
        )} */
      ]
    })
  };
};

const App = (_ref) => {
  let {} = _ref;
  return {
    name: "App",
    render: () => ({
      "type": "div",
      "properties": {
        "class": "app"
      },
      "children": [_placeHolderJs.default.registerComponent(Component1, {}, [])]
    })
  };
};

(0, _placeHolderJs.renderDOM)(App, "root");
