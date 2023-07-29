import { renderElement, mountNode } from "../DOM/DOM";
import { insertChildAtIndex } from "../DOM/utils";

const placeholderKey = Symbol("placeholder");

export default class ObservableArray {
    children = [];

    keys = [];

    getChildren(observable) {
        let didChange = false;
        const newKeys = [];
        const configArry = observable.value || [];
        const { children: prevChildren, keys: prevKeys } = this;

        let newChildren = configArry.map((childConfig, index) => {
            const { key } = childConfig.properties || {};
            if (key == null) throw new Error("Array items must have a key");
            if (newKeys.includes(key))
                throw new Error(
                    "Found a duplicate key in child array! Keys must be unique."
                );

            newKeys.push(key);

            if (prevKeys[index] === key) {
                return prevChildren[index];
            } else {
                didChange = true;
                return renderElement(childConfig);
            }
        });

        if (newChildren.length === 0) {
            if (prevKeys[0] === placeholderKey) {
                newChildren = prevChildren;
            } else {
                const child = renderElement({
                    type: "span",
                    properties: { hidden: true },
                    children: [],
                });
                newChildren = [child];
                didChange = true;
            }
            newKeys.push(placeholderKey);
        }

        if (prevChildren.length !== newChildren.length) {
            didChange = true;
        }

        this.keys = newKeys;

        return didChange ? newChildren : prevChildren;
    }

    renderChildren(parent, observable) {
        const prevChildren = this.children;
        const newChildren = this.getChildren(observable);
        if (newChildren === prevChildren) return;

        let startIndex = [...parent.childNodes].indexOf(prevChildren[0]);
        if (startIndex === -1) startIndex = parent.childNodes.length;

        newChildren.forEach((child, index) => {
            if (prevChildren[index] === child) return;

            if (prevChildren[index]) mountNode(parent, child, prevChildren[index]);
            else insertChildAtIndex(parent, child, startIndex + index);
        });

        if (newChildren.length < prevChildren.length) {
            for (let i = newChildren.length; i < prevChildren.length; i++) {
                parent.removeChild(prevChildren[i]);
            }
        }

        this.children = newChildren;
    }
}
