export function insertChildAtIndex(parent, child, index) {
  if (!index) index = 0;
  if (index >= parent.childNodes.length) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, parent.childNodes[index]);
  }
}
