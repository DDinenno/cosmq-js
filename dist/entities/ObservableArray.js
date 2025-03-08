import { insertChildAtIndex } from "../DOM/utils";
import Observable from "./Observable";
import core from "../core";

const placeholderKey = Symbol("placeholder");

export default class ObservableArray {
  data = [];

  children = [];

  keys = [];

  obs = null;

  renderFn = null;

  getKey = null;

  invalidate = null;

  subscription = null;

  origin = null;

  constructor(data, options, renderFn) {
    this.origin = core.registerObservable(this);

    const { getKey, invalidateFn } = options || {};
    if (!data) throw new Error("No obserable provided!");
    if (data instanceof Observable === false)
      throw new Error("Data isn't an observable!");
    this.assertValue(data.value);

    this.obs = data;
    this.renderFn = renderFn;
    this.getKey = getKey;
    this.invalidate = invalidateFn;
  }

  assertValue(value) {
    if (!Array.isArray(value))
      throw new Error("ObserableArray value must be an array!");
  }

  mount(parent, mountNode, renderElement) {
    this.renderChildren(parent, mountNode, renderElement);

    this.unsubscribe = this.obs.listen(() => {
      core.observableRender(this.origin, () => {
        this.renderChildren(parent, mountNode, renderElement);
      });
    });
  }

  unmount() {
    if (this.unsubscribe) this.unsubscribe();

    this.obs = null;
    this.renderFn = null;
    this.getKey = null;
    this.childen = null;
    this.keys = null;
    this.invalidate = null;
    this.data = null;
    this.origin = null;
  }

  getChanges(parent, renderElement) {
    let didChange = false;
    const newKeys = [];
    const { children: prevChildren, keys: prevKeys } = this;
    const prevData = this.data;
    this.data = this.obs.value;

    let newChildren = this.data.map((row, index) => {
      const key = this.getKey(row);

      if (key == null) throw new Error("Array items must have a key");
      if (newKeys.includes(key))
        throw new Error(
          "Found a duplicate key in child array! Keys must be unique.",
        );

      newKeys.push(key);

      if (prevKeys[index] === key) {
        if (
          this.invalidate &&
          this.invalidate(this.data[index], prevData[index])
          //|| this.data[index] !== prevData[index]
        ) {
          console.log(this.data[index], prevData[index]);
          didChange = true;

          const node = this.renderFn(row, index);
          return typeof node === "function" ? node(prevChildren[index]) : node;
        } else {
          return prevChildren[index];
        }
      } else {
        const invalidate =
          this.invalidate && this.invalidate(this.data[index], prevData[index]);

        if (prevKeys.includes(key) && !invalidate) {
          const foundIndex = prevData.findIndex((r) => this.getKey(r) === key);
          if (foundIndex !== -1) {
            didChange = true;
            return prevChildren[foundIndex];
          }
        }

        didChange = true;

        const node = this.renderFn(row, index);
        return typeof node === "function" ? node(prevChildren[index]) : node;
      }
    });

    if (newChildren.length === 0) {
      if (prevKeys[0] === placeholderKey) {
        newChildren = prevChildren;
      } else {
        const child = renderElement("span", { hidden: true }, []);
        newChildren = [child];
        didChange = true;
      }
      newKeys.push(placeholderKey);
    }

    if (prevChildren.length !== newChildren.length) {
      didChange = true;
    }

    this.keys = newKeys;

    const updatedChildren = didChange ? newChildren : prevChildren;
    const deletedChildren = [];

    prevKeys.forEach((key, index) => {
      if (!newKeys.includes(key)) {
        deletedChildren.push(prevChildren[index]);
      }
    });

    return { newChildren: updatedChildren, deletedChildren };
  }

  renderChildren(parent, mountNode, renderElement) {
    const { newChildren, deletedChildren } = this.getChanges(
      parent,
      renderElement,
    );

    for (let i = 0; i < deletedChildren.length; i++) {
      const child = deletedChildren[i];
      child.remove();
    }

    this.children = this.children.filter((c) => !deletedChildren.includes(c));

    const prevChildren = this.children;
    if (newChildren === prevChildren) return;

    newChildren.forEach((child, index) => {
      if (prevChildren[index] === child) return;
      insertChildAtIndex(parent, child, index);
    });

    this.children = newChildren;
  }
}
