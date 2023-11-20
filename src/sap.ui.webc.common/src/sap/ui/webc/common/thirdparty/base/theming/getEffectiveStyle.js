sap.ui.define(["exports", "./CustomStyle", "./getStylesString", "../FeaturesRegistry"], function (_exports, _CustomStyle, _getStylesString, _FeaturesRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getStylesString = _interopRequireDefault(_getStylesString);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const effectiveStyleMap = new Map();
  (0, _CustomStyle.attachCustomCSSChange)(tag => {
    effectiveStyleMap.delete(`${tag}_normal`); // there is custom CSS only for the component itself, not for its static area part
  });

  const getEffectiveStyle = (ElementClass, forStaticArea = false) => {
    const tag = ElementClass.getMetadata().getTag();
    const key = `${tag}_${forStaticArea ? "static" : "normal"}`;
    const openUI5Enablement = (0, _FeaturesRegistry.getFeature)("OpenUI5Enablement");
    if (!effectiveStyleMap.has(key)) {
      let effectiveStyle;
      let busyIndicatorStyles = "";
      if (openUI5Enablement) {
        busyIndicatorStyles = (0, _getStylesString.default)(openUI5Enablement.getBusyIndicatorStyles());
      }
      if (forStaticArea) {
        effectiveStyle = (0, _getStylesString.default)(ElementClass.staticAreaStyles);
      } else {
        const customStyle = (0, _CustomStyle.getCustomCSS)(tag) || "";
        const builtInStyles = (0, _getStylesString.default)(ElementClass.styles);
        effectiveStyle = `${builtInStyles} ${customStyle}`;
      }
      effectiveStyle = `${effectiveStyle} ${busyIndicatorStyles}`;
      effectiveStyleMap.set(key, effectiveStyle);
    }
    return effectiveStyleMap.get(key); // The key is guaranteed to exist
  };
  var _default = getEffectiveStyle;
  _exports.default = _default;
});