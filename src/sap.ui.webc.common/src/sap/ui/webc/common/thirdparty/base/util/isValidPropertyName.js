sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  // Note: disabled is present in IE so we explicitly allow it here.
  // Others, such as title/hidden, we explicitly override, so valid too
  const allowList = ["disabled", "title", "hidden", "role", "draggable"];
  /**
   * Checks whether a property name is valid (does not collide with existing DOM API properties)
   *
   * @param name
   * @returns {boolean}
   */
  const isValidPropertyName = name => {
    if (allowList.includes(name) || name.startsWith("aria")) {
      return true;
    }
    const classes = [HTMLElement, Element, Node];
    return !classes.some(klass => klass.prototype.hasOwnProperty(name)); // eslint-disable-line
  };
  var _default = isValidPropertyName;
  _exports.default = _default;
});