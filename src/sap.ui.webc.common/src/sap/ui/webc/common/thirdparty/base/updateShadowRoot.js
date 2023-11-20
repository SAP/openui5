sap.ui.define(["exports", "./theming/getConstructableStyle", "./theming/getEffectiveStyle", "./theming/getEffectiveLinksHrefs", "./CSP", "./Device"], function (_exports, _getConstructableStyle, _getEffectiveStyle, _getEffectiveLinksHrefs, _CSP, _Device) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
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
    const ctor = element.constructor;
    const shadowRoot = forStaticArea ? element.staticAreaItem.shadowRoot : element.shadowRoot;
    let renderResult;
    if (forStaticArea) {
      renderResult = element.renderStatic(); // this is checked before calling updateShadowRoot
    } else {
      renderResult = element.render(); // this is checked before calling updateShadowRoot
    }

    if (!shadowRoot) {
      console.warn(`There is no shadow root to update`); // eslint-disable-line
      return;
    }
    if ((0, _CSP.shouldUseLinks)()) {
      styleStrOrHrefsArr = (0, _getEffectiveLinksHrefs.default)(ctor, forStaticArea);
    } else if (document.adoptedStyleSheets && !(0, _Device.isSafari)()) {
      // Chrome
      shadowRoot.adoptedStyleSheets = (0, _getConstructableStyle.default)(ctor, forStaticArea);
    } else {
      // FF, Safari
      styleStrOrHrefsArr = (0, _getEffectiveStyle.default)(ctor, forStaticArea);
    }
    if (ctor.renderer) {
      ctor.renderer(renderResult, shadowRoot, styleStrOrHrefsArr, forStaticArea, {
        host: element
      });
      return;
    }
    ctor.render(renderResult, shadowRoot, styleStrOrHrefsArr, forStaticArea, {
      host: element
    });
  };
  var _default = updateShadowRoot;
  _exports.default = _default;
});