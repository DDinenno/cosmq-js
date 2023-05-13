export function flattenChildren(children) {
  const flattenedArray = [];
  const array = Array.isArray(children)
    ? children
    : (children && [children]) || [];

  array.forEach((child) => {
    if (Array.isArray(child)) flattenedArray.push(...child);
    return flattenedArray.push(child);
  });

  return flattenedArray;
}

export function insertChildAtIndex(parent, child, index) {
  if (!index) index = 0;
  if (index >= parent.childNodes.length) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, parent.childNodes[index]);
  }
}