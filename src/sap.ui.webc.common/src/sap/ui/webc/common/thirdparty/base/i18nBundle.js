sap.ui.define(["exports", "./asset-registries/i18n", "./util/formatMessage"], function (_exports, _i18n, _formatMessage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerCustomI18nBundleGetter = _exports.getI18nBundle = _exports.default = void 0;
  Object.defineProperty(_exports, "registerI18nLoader", {
    enumerable: true,
    get: function () {
      return _i18n.registerI18nLoader;
    }
  });
  _formatMessage = _interopRequireDefault(_formatMessage);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const I18nBundleInstances = new Map();
  let customGetI18nBundle;
  /**
   * @class
   * @public
   */
  class I18nBundle {
    constructor(packageName) {
      this.packageName = packageName;
    }
    /**
     * Returns a text in the currently loaded language
     *
     * @public
     * @param {Object|String} textObj key/defaultText pair or just the key
     * @param params Values for the placeholders
     * @returns {string}
     */
    getText(textObj, ...params) {
      if (typeof textObj === "string") {
        textObj = {
          key: textObj,
          defaultText: textObj
        };
      }
      if (!textObj || !textObj.key) {
        return "";
      }
      const bundle = (0, _i18n.getI18nBundleData)(this.packageName);
      if (bundle && !bundle[textObj.key]) {
        // eslint-disable-next-line no-console
        console.warn(`Key ${textObj.key} not found in the i18n bundle, the default text will be used`);
      }
      const messageText = bundle && bundle[textObj.key] ? bundle[textObj.key] : textObj.defaultText || textObj.key;
      return (0, _formatMessage.default)(messageText, params);
    }
  }
  /**
   * Returns the I18nBundle instance for the given package synchronously.
   *
   * @public
   * @param packageName
   * @returns { I18nBundle }
   */
  const getI18nBundleSync = packageName => {
    if (I18nBundleInstances.has(packageName)) {
      return I18nBundleInstances.get(packageName);
    }
    const i18nBundle = new I18nBundle(packageName);
    I18nBundleInstances.set(packageName, i18nBundle);
    return i18nBundle;
  };
  /**
   * Fetches and returns the I18nBundle instance for the given package.
   *
   * @public
   * @param packageName
   * @returns { Promise<I18nBundle> }
   */
  const getI18nBundle = async packageName => {
    if (customGetI18nBundle) {
      return customGetI18nBundle(packageName);
    }
    await (0, _i18n.fetchI18nBundle)(packageName);
    return getI18nBundleSync(packageName);
  };
  /**
   * Allows developers to provide a custom getI18nBundle implementation
   * If this function is called, the custom implementation will be used for all components and will completely
   * replace the default implementation.
   *
   * @public
   * @param customGet the function to use instead of the standard getI18nBundle implementation
   */
  _exports.getI18nBundle = getI18nBundle;
  const registerCustomI18nBundleGetter = customGet => {
    customGetI18nBundle = customGet;
  };
  _exports.registerCustomI18nBundleGetter = registerCustomI18nBundleGetter;
  var _default = I18nBundle;
  _exports.default = _default;
});