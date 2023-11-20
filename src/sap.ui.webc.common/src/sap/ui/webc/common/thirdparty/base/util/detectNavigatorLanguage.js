sap.ui.define(["exports", "../generated/AssetParameters"], function (_exports, _AssetParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = () => {
    const browserLanguages = navigator.languages;
    const navigatorLanguage = () => {
      return navigator.language;
    };
    const rawLocale = browserLanguages && browserLanguages[0] || navigatorLanguage();
    return rawLocale || _AssetParameters.DEFAULT_LANGUAGE;
  };
  _exports.default = _default;
});