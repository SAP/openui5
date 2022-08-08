sap.ui.define(["exports", "../generated/AssetParameters"], function (_exports, _AssetParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerThemePropertiesLoader = _exports.registerThemeProperties = _exports.isThemeRegistered = _exports.getThemeProperties = _exports.getRegisteredPackages = void 0;
  const themeStyles = new Map();
  const loaders = new Map();
  const registeredPackages = new Set();
  const registeredThemes = new Set();
  /**
   * Used to provide CSS Vars for a specific theme for a specific package.
   * The CSS Vars can be passed directly as a string (containing them), as an object with a "_" property(containing them in the "_" property), or as a URL.
   * This URL must point to a JSON file, containing a "_" property.
   *
   * Example usage:
   *  1) Pass the CSS Vars as a string directly.
   *  registerThemeProperties("my-package", "my_theme", ":root{--var1: red;}");
   *
   * @public
   * @param packageName - the NPM package for which CSS Vars are registered
   * @param themeName - the theme which the CSS Vars implement
   * @param style - the style content directly
   * @deprecated
   */

  const registerThemeProperties = (_packageName, _themeName, _style) => {
    throw new Error("`registerThemeProperties` has been depracated. Use `registerThemePropertiesLoader` instead.");
  };

  _exports.registerThemeProperties = registerThemeProperties;

  const registerThemePropertiesLoader = (packageName, themeName, loader) => {
    loaders.set(`${packageName}/${themeName}`, loader);
    registeredPackages.add(packageName);
    registeredThemes.add(themeName);
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
      console.warn(`You have requested a non-registered theme ${themeName} - falling back to ${_AssetParameters.DEFAULT_THEME}. Registered themes are: ${regThemesStr}`);
      /* eslint-disable-line */

      return _getThemeProperties(packageName, _AssetParameters.DEFAULT_THEME);
    }

    return _getThemeProperties(packageName, themeName);
  };

  _exports.getThemeProperties = getThemeProperties;

  const _getThemeProperties = async (packageName, themeName) => {
    const loader = loaders.get(`${packageName}/${themeName}`);

    if (!loader) {
      // no themes for package
      console.error(`Theme [${themeName}] not registered for package [${packageName}]`);
      /* eslint-disable-line */

      return;
    }

    let data;

    try {
      data = await loader(themeName);
    } catch (e) {
      console.error(packageName, e.message);
      /* eslint-disable-line */

      return;
    }

    const themeProps = data._ || data;
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