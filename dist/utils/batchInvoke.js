const waitTime = 50;

let functions = {};
let timer;

export default function batchInvoke(id, func) {
  if (Object.keys(functions).length === 0) {
    timer = setTimeout(() => {
      const list = Object.values(functions);
      list.forEach((fn) => fn());
      timer = null;
      functions = {};
    }, waitTime);
  }

  functions[id] = func;
}
