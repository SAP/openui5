sap.ui.define(["exports", "../getSharedResource", "../FeaturesRegistry", "./getActiveElement"], function (_exports, _getSharedResource, _FeaturesRegistry, _getActiveElement) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isFocusedElementWithinNode = _exports.isClickInRect = _exports.getNextZIndex = _exports.getFocusedElement = _exports.getCurrentZIndex = _exports.getClosedPopupParent = void 0;
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  _getActiveElement = _interopRequireDefault(_getActiveElement);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  const PopupUtilsData = (0, _getSharedResource.default)("PopupUtilsData", {});
  PopupUtilsData.currentZIndex = PopupUtilsData.currentZIndex || 100;

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
      currentNode = Array.from(currentNode.shadowRoot.children).find(n => n.localName !== "style");
    }

    if (currentNode === child) {
      return true;
    }

    const childNodes = currentNode.localName === "slot" ? currentNode.assignedNodes() : currentNode.children;

    if (childNodes) {
      return Array.from(childNodes).some(n => isNodeContainedWithin(n, child));
    }
  };

  const isPointInRect = (x, y, rect) => {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  const isClickInRect = (event, rect) => {
    let x;
    let y;

    if (event.touches) {
      const touch = event.touches[0];
      x = touch.clientX;
      y = touch.clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    return isPointInRect(x, y, rect);
  };

  _exports.isClickInRect = isClickInRect;

  const getClosedPopupParent = el => {
    const parent = el.parentElement || el.getRootNode && el.getRootNode().host;

    if (parent && (parent.showAt && parent.isUI5Element || parent.open && parent.isUI5Element || parent === document.documentElement)) {
      return parent;
    }

    return getClosedPopupParent(parent);
  };

  _exports.getClosedPopupParent = getClosedPopupParent;

  const getNextZIndex = () => {
    const OpenUI5Support = (0, _FeaturesRegistry.getFeature)("OpenUI5Support");

    if (OpenUI5Support && OpenUI5Support.isLoaded()) {
      // use OpenUI5 for getting z-index values, if loaded
      return OpenUI5Support.getNextZIndex();
    }

    PopupUtilsData.currentZIndex += 2;
    return PopupUtilsData.currentZIndex;
  };

  _exports.getNextZIndex = getNextZIndex;

  const getCurrentZIndex = () => {
    return PopupUtilsData.currentZIndex;
  };

  _exports.getCurrentZIndex = getCurrentZIndex;
});