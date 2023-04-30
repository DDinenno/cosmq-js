let batchedCalls = {};
let batchTimeout = null;

export default function batchInvoke(instance, callback) {
  batchedCalls[instance] = callback;

  if (batchTimeout === null)
    batchTimeout = setTimeout(() => {
      Object.entries(batchedCalls).forEach(([inst, cb]) => cb.bind(inst)());
      batchTimeout = null;
      batchedCalls = {};
    }, 200);
}
