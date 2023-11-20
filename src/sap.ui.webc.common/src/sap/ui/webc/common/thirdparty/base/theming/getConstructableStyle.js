sap.ui.define(["exports", "./getEffectiveStyle", "./CustomStyle"], function (_exports, _getEffectiveStyle, _CustomStyle) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getEffectiveStyle = _interopRequireDefault(_getEffectiveStyle);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const constructableStyleMap = new Map();
  (0, _CustomStyle.attachCustomCSSChange)(tag => {
    constructableStyleMap.delete(`${tag}_normal`); // there is custom CSS only for the component itself, not for its static area part
  });
  /**
   * Returns (and caches) a constructable style sheet for a web component class
   * Note: Chrome
   * @param ElementClass
   * @returns {*}
   */
  const getConstructableStyle = (ElementClass, forStaticArea = false) => {
    const tag = ElementClass.getMetadata().getTag();
    const key = `${tag}_${forStaticArea ? "static" : "normal"}`;
    if (!constructableStyleMap.has(key)) {
      const styleContent = (0, _getEffectiveStyle.default)(ElementClass, forStaticArea);
      const style = new CSSStyleSheet();
      style.replaceSync(styleContent);
      constructableStyleMap.set(key, [style]);
    }
    return constructableStyleMap.get(key);
  };
  var _default = getConstructableStyle;
  _exports.default = _default;
});