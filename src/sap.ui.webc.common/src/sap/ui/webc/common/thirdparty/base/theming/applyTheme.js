sap.ui.define(["exports", "../asset-registries/Themes", "../ManagedStyles", "./getThemeDesignerTheme", "./ThemeLoaded", "../FeaturesRegistry"], function (_exports, _Themes, _ManagedStyles, _getThemeDesignerTheme, _ThemeLoaded, _FeaturesRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getThemeDesignerTheme = _interopRequireDefault(_getThemeDesignerTheme);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const BASE_THEME_PACKAGE = "@ui5/webcomponents-theming";
  const isThemeBaseRegistered = () => {
    const registeredPackages = (0, _Themes.getRegisteredPackages)();
    return registeredPackages.has(BASE_THEME_PACKAGE);
  };
  const loadThemeBase = async theme => {
    if (!isThemeBaseRegistered()) {
      return;
    }
    const cssData = await (0, _Themes.getThemeProperties)(BASE_THEME_PACKAGE, theme);
    if (cssData) {
      (0, _ManagedStyles.createOrUpdateStyle)(cssData, "data-ui5-theme-properties", BASE_THEME_PACKAGE);
    }
  };
  const deleteThemeBase = () => {
    (0, _ManagedStyles.removeStyle)("data-ui5-theme-properties", BASE_THEME_PACKAGE);
  };
  const loadComponentPackages = async theme => {
    const registeredPackages = (0, _Themes.getRegisteredPackages)();
    registeredPackages.forEach(async packageName => {
      if (packageName === BASE_THEME_PACKAGE) {
        return;
      }
      const cssData = await (0, _Themes.getThemeProperties)(packageName, theme);
      if (cssData) {
        (0, _ManagedStyles.createOrUpdateStyle)(cssData, "data-ui5-theme-properties", packageName);
      }
    });
  };
  const detectExternalTheme = () => {
    // If theme designer theme is detected, use this
    const extTheme = (0, _getThemeDesignerTheme.default)();
    if (extTheme) {
      return extTheme;
    }

    // If OpenUI5Support is enabled, try to find out if it loaded variables
    const OpenUI5Support = (0, _FeaturesRegistry.getFeature)("OpenUI5Support");
    if (OpenUI5Support) {
      const varsLoaded = OpenUI5Support.cssVariablesLoaded();
      if (varsLoaded) {
        return {
          themeName: OpenUI5Support.getConfigurationSettingsObject().theme // just themeName, baseThemeName is only relevant for custom themes
        };
      }
    }
  };

  const applyTheme = async theme => {
    const extTheme = detectExternalTheme();

    // Only load theme_base properties if there is no externally loaded theme, or there is, but it is not being loaded
    if (!extTheme || theme !== extTheme.themeName) {
      await loadThemeBase(theme);
    } else {
      deleteThemeBase();
    }

    // Always load component packages properties. For non-registered themes, try with the base theme, if any
    const packagesTheme = (0, _Themes.isThemeRegistered)(theme) ? theme : extTheme && extTheme.baseThemeName;
    await loadComponentPackages(packagesTheme);
    (0, _ThemeLoaded.fireThemeLoaded)(theme);
  };
  var _default = applyTheme;
  _exports.default = _default;
});