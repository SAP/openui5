sap.ui.define(["exports", "../InitialConfiguration", "./Language", "../util/getDesigntimePropertyAsArray", "../util/detectNavigatorLanguage"], function (_exports, _InitialConfiguration, _Language, _getDesigntimePropertyAsArray, _detectNavigatorLanguage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getRTL = void 0;
  _getDesigntimePropertyAsArray = _interopRequireDefault(_getDesigntimePropertyAsArray);
  _detectNavigatorLanguage = _interopRequireDefault(_detectNavigatorLanguage);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const M_ISO639_OLD_TO_NEW = {
    "iw": "he",
    "ji": "yi",
    "in": "id",
    "sh": "sr"
  };
  const A_RTL_LOCALES = (0, _getDesigntimePropertyAsArray.default)("$cldr-rtl-locales:ar,fa,he$") || [];
  /**
   * Checks whether the language is using RTL
   * @param {string} language
   * @returns {boolean} whether the language is using RTL
   */
  const impliesRTL = language => {
    language = language && M_ISO639_OLD_TO_NEW[language] || language;
    return A_RTL_LOCALES.indexOf(language) >= 0;
  };
  /**
   * Gets the effective RTL setting by first checking the configuration
   * and if not set using the currently set language or the navigator language if the language is not explicitly set.
   * @returns {boolean} whether RTL should be used
   */
  const getRTL = () => {
    if (typeof document === "undefined") {
      return false;
    }
    const configurationRTL = (0, _InitialConfiguration.getRTL)();
    if (configurationRTL !== undefined) {
      return !!configurationRTL;
    }
    return impliesRTL((0, _Language.getLanguage)() || (0, _detectNavigatorLanguage.default)());
  };
  // eslint-disable-line
  _exports.getRTL = getRTL;
});