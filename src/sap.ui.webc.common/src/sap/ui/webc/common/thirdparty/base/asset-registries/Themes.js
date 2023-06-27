sap.ui.define(["exports", "../generated/AssetParameters", "../theming/ThemeRegistered"], function (_exports, _AssetParameters, _ThemeRegistered) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerThemePropertiesLoader = _exports.isThemeRegistered = _exports.getThemeProperties = _exports.getRegisteredPackages = void 0;
  const themeStyles = new Map();
  const loaders = new Map();
  const registeredPackages = new Set();
  const registeredThemes = new Set();
  const registerThemePropertiesLoader = (packageName, themeName, loader) => {
    loaders.set(`${packageName}/${themeName}`, loader);
    registeredPackages.add(packageName);
    registeredThemes.add(themeName);
    (0, _ThemeRegistered.fireThemeRegistered)(themeName);
  };
  _exports.registerThemePropertiesLoader = registerThemePropertiesLoader;
  const getThemeProperties = async (packageName, themeName) => {
    const style = themeStyles.get(`${packageName}_${themeName}`);
    if (style !== undefined) {
      // it's valid for style to be an empty string
      return style;
    }
    if (!registeredThemes.has(themeName)) {
      const regThemesStr = [...registeredThemes.values()].join(", ");
      console.warn(`You have requested a non-registered theme ${themeName} - falling back to ${_AssetParameters.DEFAULT_THEME}. Registered themes are: ${regThemesStr}`); /* eslint-disable-line */
      return _getThemeProperties(packageName, _AssetParameters.DEFAULT_THEME);
    }
    return _getThemeProperties(packageName, themeName);
  };
  _exports.getThemeProperties = getThemeProperties;
  const _getThemeProperties = async (packageName, themeName) => {
    const loader = loaders.get(`${packageName}/${themeName}`);
    if (!loader) {
      // no themes for package
      console.error(`Theme [${themeName}] not registered for package [${packageName}]`); /* eslint-disable-line */
      return;
    }
    let data;
    try {
      data = await loader(themeName);
    } catch (error) {
      const e = error;
      console.error(packageName, e.message); /* eslint-disable-line */
      return;
    }
    const themeProps = data._ || data; // Refactor: remove _ everywhere
    themeStyles.set(`${packageName}_${themeName}`, themeProps);
    return themeProps;
  };
  const getRegisteredPackages = () => {
    return registeredPackages;
  };
  _exports.getRegisteredPackages = getRegisteredPackages;
  const isThemeRegistered = theme => {
    return registeredThemes.has(theme);
  };
  _exports.isThemeRegistered = isThemeRegistered;
});