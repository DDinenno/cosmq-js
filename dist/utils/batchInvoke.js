const waitTime = 5;

const scope = {};

export default function batchInvoke(scopeId, id, func) {
  if (scopeId in scope === false) {
    scope[scopeId] = { functions: {} };
  }

  const functions = scope[scopeId].functions;

  if (Object.keys(functions).length === 0) {
    scope[scopeId].timer = setTimeout(() => {
      const list = Object.values(functions);
      list.forEach((fn) => fn());
      scope[scopeId].timer = null;
      scope[scopeId].functions = {};
    }, waitTime);
  }

  functions[id] = func;
}
