sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isSlot = _exports.getSlottedElementsList = _exports.getSlottedElements = _exports.getSlotName = void 0;
  /**
   * Determines the slot to which a node should be assigned
   * @param node Text node or HTML element
   * @returns {string}
   */
  const getSlotName = node => {
    // Text nodes can only go to the default slot
    if (!(node instanceof HTMLElement)) {
      return "default";
    }

    // Discover the slot based on the real slot name (f.e. footer => footer, or content-32 => content)
    const slot = node.getAttribute("slot");
    if (slot) {
      const match = slot.match(/^(.+?)-\d+$/);
      return match ? match[1] : slot;
    }

    // Use default slot as a fallback
    return "default";
  };
  _exports.getSlotName = getSlotName;
  const isSlot = el => el && el instanceof HTMLElement && el.localName === "slot";
  _exports.isSlot = isSlot;
  const getSlottedElements = el => {
    if (isSlot(el)) {
      return el.assignedNodes({
        flatten: true
      }).filter(item => item instanceof HTMLElement);
    }
    return [el];
  };
  _exports.getSlottedElements = getSlottedElements;
  const getSlottedElementsList = elList => {
    const reducer = (acc, curr) => acc.concat(getSlottedElements(curr));
    return elList.reduce(reducer, []);
  };
  _exports.getSlottedElementsList = getSlottedElementsList;
});