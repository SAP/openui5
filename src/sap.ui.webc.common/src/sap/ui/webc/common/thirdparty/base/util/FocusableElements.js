sap.ui.define(["exports", "./isElementHidden", "./isElementClickable", "../UI5Element"], function (_exports, _isElementHidden, _isElementClickable, _UI5Element) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getLastFocusableElement = _exports.getFirstFocusableElement = void 0;
  _isElementHidden = _interopRequireDefault(_isElementHidden);
  _isElementClickable = _interopRequireDefault(_isElementClickable);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const isFocusTrap = el => {
    return el.hasAttribute("data-ui5-focus-trap");
  };
  const getFirstFocusableElement = async (container, startFromContainer) => {
    if (!container || (0, _isElementHidden.default)(container)) {
      return null;
    }
    return findFocusableElement(container, true, startFromContainer);
  };
  _exports.getFirstFocusableElement = getFirstFocusableElement;
  const getLastFocusableElement = async (container, startFromContainer) => {
    if (!container || (0, _isElementHidden.default)(container)) {
      return null;
    }
    return findFocusableElement(container, false, startFromContainer);
  };
  _exports.getLastFocusableElement = getLastFocusableElement;
  const isElemFocusable = el => {
    return el.hasAttribute("data-ui5-focus-redirect") || !(0, _isElementHidden.default)(el);
  };
  const findFocusableElement = async (container, forward, startFromContainer) => {
    let child;
    let assignedElements;
    let currentIndex = -1;
    if (container.shadowRoot) {
      child = forward ? container.shadowRoot.firstChild : container.shadowRoot.lastChild;
    } else if (container instanceof HTMLSlotElement && container.assignedNodes()) {
      assignedElements = container.assignedNodes();
      currentIndex = forward ? 0 : assignedElements.length - 1;
      child = assignedElements[currentIndex];
    } else if (startFromContainer) {
      child = container;
    } else {
      child = forward ? container.firstElementChild : container.lastElementChild;
    }
    let focusableDescendant;
    /* eslint-disable no-await-in-loop */
    while (child) {
      const originalChild = child;
      if ((0, _UI5Element.instanceOfUI5Element)(child)) {
        child = await child.getFocusDomRefAsync();
      }
      if (!child) {
        return null;
      }
      if (child.nodeType === 1 && isElemFocusable(child) && !isFocusTrap(child)) {
        if ((0, _isElementClickable.default)(child)) {
          return child && typeof child.focus === "function" ? child : null;
        }
        focusableDescendant = await findFocusableElement(child, forward);
        if (focusableDescendant) {
          return focusableDescendant && typeof focusableDescendant.focus === "function" ? focusableDescendant : null;
        }
      }
      child = forward ? originalChild.nextSibling : originalChild.previousSibling;
      // If the child element is not part of the currently assigned element,
      // we have to check the next/previous element assigned to the slot or continue with the next/previous sibling of the slot,
      // otherwise, the nextSibling/previousSibling is the next element inside the light DOM
      if (assignedElements && !assignedElements[currentIndex].contains(child)) {
        currentIndex = forward ? currentIndex + 1 : currentIndex - 1;
        child = assignedElements[currentIndex];
      }
    }
    /* eslint-enable no-await-in-loop */
    return null;
  };
});