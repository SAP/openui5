sap.ui.define(["exports", "./isElementHidden"], function (_exports, _isElementHidden) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _isElementHidden = _interopRequireDefault(_isElementHidden);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Returns if the HTMLElement is tabbable.
   *
   * @public
   * @param { HTMLElement } el the component to operate on (component that slots or contains within its shadow root the items the user navigates among)
   * @returns { boolean } true if the element is tabbable or false - if not
   */
  const isElementTabbable = el => {
    if (!el) {
      return false;
    }
    const nodeName = el.nodeName.toLowerCase();
    if (el.hasAttribute("data-sap-no-tab-ref")) {
      return false;
    }
    if ((0, _isElementHidden.default)(el)) {
      return false;
    }
    const tabIndex = el.getAttribute("tabindex");
    if (tabIndex !== null && tabIndex !== undefined) {
      return parseInt(tabIndex) >= 0;
    }
    if (nodeName === "a" || /input|select|textarea|button|object/.test(nodeName)) {
      return !el.disabled;
    }
    return false;
  };
  var _default = isElementTabbable;
  _exports.default = _default;
});