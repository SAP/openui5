sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Creates a <style> tag in the <head> tag
   * @param cssText - the CSS
   * @param attributes - optional attributes to add to the tag
   * @returns {HTMLElement}
   */
  const createStyleInHead = (cssText, attributes) => {
    const style = document.createElement("style");
    style.type = "text/css";
    if (attributes) {
      Object.entries(attributes).forEach(pair => style.setAttribute(...pair));
    }
    style.textContent = cssText;
    document.head.appendChild(style);
    return style;
  };
  var _default = createStyleInHead;
  _exports.default = _default;
});