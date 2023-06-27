sap.ui.define(["exports", "../util/createLinkInHead", "../validateThemeRoot", "../InitialConfiguration", "./Theme"], function (_exports, _createLinkInHead, _validateThemeRoot, _InitialConfiguration, _Theme) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setThemeRoot = _exports.getThemeRoot = _exports.attachCustomThemeStylesToHead = void 0;
  _createLinkInHead = _interopRequireDefault(_createLinkInHead);
  _validateThemeRoot = _interopRequireDefault(_validateThemeRoot);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let currThemeRoot;
  /**
   * Returns the current theme root.
   *
   * @public
   * @since 1.14.0
   * @returns { string } the current theme root
   */
  const getThemeRoot = () => {
    if (currThemeRoot === undefined) {
      currThemeRoot = (0, _InitialConfiguration.getThemeRoot)();
    }
    return currThemeRoot;
  };
  /**
   * Sets theme root for the current theme.
   * When set, the framework will validate the theme root and fetch the theme styles (CSS variables) from this location.
   *
   * <b>Note:</b> The feature is specific to custom themes, created with the `UI Theme Designer`.
   * The provided theme root is used only as a base to construct the actual location of the theme styles: `{themeRoot}/.../css_variables.css`.
   *
   * <br/>
   *
   * <b>Note:</b> Certain security restrictions will apply before fetching the theme assets.
   * Absolute URLs to a different origin than the current page will result in using the current page as an origin.
   * To allow specific origins, use &lt;meta name="sap-allowedThemeOrigins" content="https://my-example-host.com/"&gt; tag inside the &lt;head&gt; of the page.
   *
   * @public
   * @since 1.14.0
   * @param { string } themeRoot the new theme root
   * @returns { Promise<void> }
   */
  _exports.getThemeRoot = getThemeRoot;
  const setThemeRoot = themeRoot => {
    if (currThemeRoot === themeRoot) {
      return;
    }
    currThemeRoot = themeRoot;
    if (!(0, _validateThemeRoot.default)(themeRoot)) {
      console.warn(`The ${themeRoot} is not valid. Check the allowed origins as suggested in the "setThemeRoot" description.`); // eslint-disable-line
      return;
    }
    return attachCustomThemeStylesToHead((0, _Theme.getTheme)());
  };
  _exports.setThemeRoot = setThemeRoot;
  const formatThemeLink = theme => {
    return `${getThemeRoot()}Base/baseLib/${theme}/css_variables.css`; // theme root is always set at this point.
  };

  const attachCustomThemeStylesToHead = async theme => {
    const link = document.querySelector(`[sap-ui-webcomponents-theme="${theme}"]`);
    if (link) {
      document.head.removeChild(link);
    }
    await (0, _createLinkInHead.default)(formatThemeLink(theme), {
      "sap-ui-webcomponents-theme": theme
    });
  };
  _exports.attachCustomThemeStylesToHead = attachCustomThemeStylesToHead;
});