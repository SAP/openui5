sap.ui.define(["exports", "../InitialConfiguration", "../Render", "../theming/applyTheme", "../theming/getThemeDesignerTheme", "../generated/AssetParameters"], function (_exports, _InitialConfiguration, _Render, _applyTheme, _getThemeDesignerTheme, _AssetParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setTheme = _exports.isTheme = _exports.isLegacyThemeFamily = _exports.getTheme = _exports.getDefaultTheme = void 0;
  _applyTheme = _interopRequireDefault(_applyTheme);
  _getThemeDesignerTheme = _interopRequireDefault(_getThemeDesignerTheme);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let curTheme;
  /**
   * Returns the current theme.
   * @public
   * @returns {string} the current theme name
   */
  const getTheme = () => {
    if (curTheme === undefined) {
      curTheme = (0, _InitialConfiguration.getTheme)();
    }
    return curTheme;
  };
  /**
   * Applies a new theme after fetching its assets from the network.
   * @public
   * @param {string} theme the name of the new theme
   * @returns {Promise<void>} a promise that is resolved when the new theme assets have been fetched and applied to the DOM
   */
  _exports.getTheme = getTheme;
  const setTheme = async theme => {
    if (curTheme === theme) {
      return;
    }
    curTheme = theme;
    // Update CSS Custom Properties
    await (0, _applyTheme.default)(curTheme);
    await (0, _Render.reRenderAllUI5Elements)({
      themeAware: true
    });
  };
  /**
   * Returns the default theme.
   *
   * Note: Default theme might be different than the configurated one.
   *
   * @public
   * @returns {string}
   */
  _exports.setTheme = setTheme;
  const getDefaultTheme = () => {
    return _AssetParameters.DEFAULT_THEME;
  };
  /**
   * Returns if the given theme name is the one currently applied.
   * @private
   * @param {string} theme
   * @returns {boolean}
   */
  _exports.getDefaultTheme = getDefaultTheme;
  const isTheme = theme => {
    const currentTheme = getTheme();
    return currentTheme === theme || currentTheme === `${theme}_exp`;
  };
  /**
   * Returns if the currently set theme is part of legacy theme families ("sap_belize" or "sap_fiori_3").
   * <b>Note</b>: in addition, the method checks the base theme of a custom theme, built via the ThemeDesigner.
   *
   * @private
   * @returns { boolean }
   */
  _exports.isTheme = isTheme;
  const isLegacyThemeFamily = () => {
    const currentTheme = getTheme();
    if (!isKnownTheme(currentTheme)) {
      return !(0, _getThemeDesignerTheme.default)()?.baseThemeName?.startsWith("sap_horizon");
    }
    return !currentTheme.startsWith("sap_horizon");
  };
  _exports.isLegacyThemeFamily = isLegacyThemeFamily;
  const isKnownTheme = theme => _AssetParameters.SUPPORTED_THEMES.includes(theme);
});