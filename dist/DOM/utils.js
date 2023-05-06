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
