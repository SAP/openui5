sap.ui.define(["exports", "./isNodeHidden"], function (_exports, _isNodeHidden) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _isNodeHidden = _interopRequireDefault(_isNodeHidden);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const isNodeTabbable = node => {
    if (!node) {
      return false;
    }
    const nodeName = node.nodeName.toLowerCase();
    if (node.hasAttribute("data-sap-no-tab-ref")) {
      return false;
    }
    if ((0, _isNodeHidden.default)(node)) {
      return false;
    }
    const tabIndex = node.getAttribute("tabindex");
    if (tabIndex !== null && tabIndex !== undefined) {
      return parseInt(tabIndex) >= 0;
    }
    if (nodeName === "a" || /input|select|textarea|button|object/.test(nodeName)) {
      return !node.disabled;
    }
  };
  var _default = isNodeTabbable;
  _exports.default = _default;
});