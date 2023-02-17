sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Creates a <link> tag in the <head> tag
   * @param href - the CSS
   * @param attributes - optional attributes to add to the tag
   * @returns {HTMLElement}
   */
  const createLinkInHead = (href, attributes = {}) => {
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    Object.entries(attributes).forEach(pair => link.setAttribute(...pair));
    link.href = href;
    document.head.appendChild(link);
    return link;
  };
  var _default = createLinkInHead;
  _exports.default = _default;
});