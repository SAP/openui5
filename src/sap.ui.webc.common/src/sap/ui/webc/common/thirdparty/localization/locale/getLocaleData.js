sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/LocaleData", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/core/LocaleData"], function (_exports, _LocaleData, _getLocale, _LocaleData2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getLocale = _interopRequireDefault(_getLocale);
  _LocaleData2 = _interopRequireDefault(_LocaleData2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const instances = new Map();

  /**
   * Fetches and returns а LocaleData object for the required locale
   * For more information on this object's API, please see:
   * https://ui5.sap.com/#/api/sap.ui.core.LocaleData
   *
   * @param lang - if left empty, will use the configured/current locale
   * @returns {LocaleData}
   */
  const getLocaleData = async lang => {
    const locale = (0, _getLocale.default)(lang);
    const localeLang = locale.getLanguage();
    if (!instances.has(localeLang)) {
      await (0, _LocaleData.fetchCldr)(locale.getLanguage(), locale.getRegion(), locale.getScript());
      instances.set(localeLang, _LocaleData2.default.getInstance(locale));
    }
    return instances.get(localeLang);
  };
  var _default = getLocaleData;
  _exports.default = _default;
});