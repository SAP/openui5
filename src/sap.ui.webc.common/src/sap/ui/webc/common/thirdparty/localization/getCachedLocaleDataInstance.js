sap.ui.define(["exports", "./LocaleData"], function (_exports, _LocaleData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _LocaleData = _interopRequireDefault(_LocaleData);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const cache = new Map();
  const getCachedLocaleDataInstance = locale => {
    if (!cache.has(locale)) {
      cache.set(locale, new _LocaleData.default(locale));
    }
    return cache.get(locale);
  };
  var _default = getCachedLocaleDataInstance;
  _exports.default = _default;
});