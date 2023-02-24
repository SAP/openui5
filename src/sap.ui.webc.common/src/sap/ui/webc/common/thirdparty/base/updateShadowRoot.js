sap.ui.define(["exports", "./renderer/executeTemplate", "./theming/getConstructableStyle", "./theming/getEffectiveStyle", "./theming/getEffectiveLinksHrefs", "./CSP"], function (_exports, _executeTemplate, _getConstructableStyle, _getEffectiveStyle, _getEffectiveLinksHrefs, _CSP) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _executeTemplate = _interopRequireDefault(_executeTemplate);
  _getConstructableStyle = _interopRequireDefault(_getConstructableStyle);
  _getEffectiveStyle = _interopRequireDefault(_getEffectiveStyle);
  _getEffectiveLinksHrefs = _interopRequireDefault(_getEffectiveLinksHrefs);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Updates the shadow root of a UI5Element or its static area item
   * @param element
   * @param forStaticArea
   */
  const updateShadowRoot = (element, forStaticArea = false) => {
    let styleStrOrHrefsArr;
    const template = forStaticArea ? "staticAreaTemplate" : "template";
    const shadowRoot = forStaticArea ? element.staticAreaItem.shadowRoot : element.shadowRoot;
    const renderResult = (0, _executeTemplate.default)(element.constructor[template], element);
    if ((0, _CSP.shouldUseLinks)()) {
      styleStrOrHrefsArr = (0, _getEffectiveLinksHrefs.default)(element.constructor, forStaticArea);
    } else if (document.adoptedStyleSheets) {
      // Chrome
      shadowRoot.adoptedStyleSheets = (0, _getConstructableStyle.default)(element.constructor, forStaticArea);
    } else {
      // FF, Safari
      styleStrOrHrefsArr = (0, _getEffectiveStyle.default)(element.constructor, forStaticArea);
    }
    element.constructor.render(renderResult, shadowRoot, styleStrOrHrefsArr, forStaticArea, {
      host: element
    });
  };
  var _default = updateShadowRoot;
  _exports.default = _default;
});