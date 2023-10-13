sap.ui.define(["exports", "../getSharedResource", "../FeaturesRegistry", "./getActiveElement"], function (_exports, _getSharedResource, _FeaturesRegistry, _getActiveElement) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isFocusedElementWithinNode = _exports.isClickInRect = _exports.getNextZIndex = _exports.getFocusedElement = _exports.getCurrentZIndex = _exports.getClosedPopupParent = void 0;
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  _getActiveElement = _interopRequireDefault(_getActiveElement);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const popupUtilsData = (0, _getSharedResource.default)("PopupUtilsData", {
    currentZIndex: 100
  });
  const getFocusedElement = () => {
    const element = (0, _getActiveElement.default)();
    return element && typeof element.focus === "function" ? element : null;
  };
  _exports.getFocusedElement = getFocusedElement;
  const isFocusedElementWithinNode = node => {
    const fe = getFocusedElement();
    if (fe) {
      return isNodeContainedWithin(node, fe);
    }
    return false;
  };
  _exports.isFocusedElementWithinNode = isFocusedElementWithinNode;
  const isNodeContainedWithin = (parent, child) => {
    let currentNode = parent;
    if (currentNode.shadowRoot) {
      const children = Array.from(currentNode.shadowRoot.children);
      currentNode = children.find(n => n.localName !== "style");
      if (!currentNode) {
        return false;
      }
    }
    if (currentNode === child) {
      return true;
    }
    const childNodes = currentNode.localName === "slot" ? currentNode.assignedNodes() : currentNode.children;
    if (childNodes) {
      return Array.from(childNodes).some(n => isNodeContainedWithin(n, child));
    }
    return false;
  };
  const isPointInRect = (x, y, rect) => {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };
  const isClickInRect = (e, rect) => {
    let x;
    let y;
    if (e instanceof MouseEvent) {
      x = e.clientX;
      y = e.clientY;
    } else {
      const touch = e.touches[0];
      x = touch.clientX;
      y = touch.clientY;
    }
    return isPointInRect(x, y, rect);
  };
  _exports.isClickInRect = isClickInRect;
  function instanceOfPopup(object) {
    return "isUI5Element" in object && "_show" in object;
  }
  const getClosedPopupParent = el => {
    const parent = el.parentElement || el.getRootNode && el.getRootNode().host;
    if (parent && (instanceOfPopup(parent) || parent === document.documentElement)) {
      return parent;
    }
    return getClosedPopupParent(parent);
  };
  _exports.getClosedPopupParent = getClosedPopupParent;
  const getNextZIndex = () => {
    const openUI5Support = (0, _FeaturesRegistry.getFeature)("OpenUI5Support");
    if (openUI5Support && openUI5Support.isOpenUI5Detected()) {
      // use OpenUI5 for getting z-index values, if loaded
      return openUI5Support.getNextZIndex();
    }
    popupUtilsData.currentZIndex += 2;
    return popupUtilsData.currentZIndex;
  };
  _exports.getNextZIndex = getNextZIndex;
  const getCurrentZIndex = () => {
    return popupUtilsData.currentZIndex;
  };
  _exports.getCurrentZIndex = getCurrentZIndex;
});