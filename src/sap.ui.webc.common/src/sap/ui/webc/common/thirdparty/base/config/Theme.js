sap.ui.define(["exports", "../InitialConfiguration", "../Render", "../theming/applyTheme"], function (_exports, _InitialConfiguration, _Render, _applyTheme) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setTheme = _exports.isThemeFamily = _exports.isTheme = _exports.getTheme = void 0;
  _applyTheme = _interopRequireDefault(_applyTheme);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let theme;
  const getTheme = () => {
    if (theme === undefined) {
      theme = (0, _InitialConfiguration.getTheme)();
    }
    return theme;
  };
  _exports.getTheme = getTheme;
  const setTheme = async newTheme => {
    if (theme === newTheme) {
      return;
    }
    theme = newTheme;

    // Update CSS Custom Properties
    await (0, _applyTheme.default)(theme);
    await (0, _Render.reRenderAllUI5Elements)({
      themeAware: true
    });
  };

  /**
   * Returns if the given theme name is the one currently applied.
   * @private
   * @param {String}
   * @returns {boolean}
   */
  _exports.setTheme = setTheme;
  const isTheme = _theme => {
    const currentTheme = getTheme();
    return currentTheme === _theme || currentTheme === `${_theme}_exp`;
  };

  /**
   * Returns if the current theme is part of given theme family
   * @private
   * @param {String} the theme family
   * @returns {boolean}
   */
  _exports.isTheme = isTheme;
  const isThemeFamily = _theme => {
    return getTheme().startsWith(_theme);
  };
  _exports.isThemeFamily = isThemeFamily;
});