sap.ui.define(['require', "sap/ui/webc/common/thirdparty/base/asset-registries/Themes"], function (require, _Themes) {
  "use strict";

  const loadThemeProperties = async themeName => {
    switch (themeName) {
      case "sap_belize":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_belize/parameters-bundle.css.json"], resolve)))).default;
      case "sap_belize_hcb":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_belize_hcb/parameters-bundle.css.json"], resolve)))).default;
      case "sap_belize_hcw":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_belize_hcw/parameters-bundle.css.json"], resolve)))).default;
      case "sap_fiori_3":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_fiori_3/parameters-bundle.css.json"], resolve)))).default;
      case "sap_fiori_3_dark":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_fiori_3_dark/parameters-bundle.css.json"], resolve)))).default;
      case "sap_fiori_3_hcb":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_fiori_3_hcb/parameters-bundle.css.json"], resolve)))).default;
      case "sap_fiori_3_hcw":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_fiori_3_hcw/parameters-bundle.css.json"], resolve)))).default;
      case "sap_horizon":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_horizon/parameters-bundle.css.json"], resolve)))).default;
      case "sap_horizon_dark":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_horizon_dark/parameters-bundle.css.json"], resolve)))).default;
      case "sap_horizon_dark_exp":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_horizon_dark_exp/parameters-bundle.css.json"], resolve)))).default;
      case "sap_horizon_exp":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_horizon_exp/parameters-bundle.css.json"], resolve)))).default;
      case "sap_horizon_hcb":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_horizon_hcb/parameters-bundle.css.json"], resolve)))).default;
      case "sap_horizon_hcb_exp":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_horizon_hcb_exp/parameters-bundle.css.json"], resolve)))).default;
      case "sap_horizon_hcw":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_horizon_hcw/parameters-bundle.css.json"], resolve)))).default;
      case "sap_horizon_hcw_exp":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/themes/sap_horizon_hcw_exp/parameters-bundle.css.json"], resolve)))).default;
      default:
        throw "unknown theme";
    }
  };
  const loadAndCheck = async themeName => {
    const data = await loadThemeProperties(themeName);
    if (typeof data === "string" && data.endsWith(".json")) {
      throw new Error(`[themes] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use 'import ".../Assets-static.js"'. Check the "Assets" documentation for more information.`);
    }
    return data;
  };
  ["sap_belize", "sap_belize_hcb", "sap_belize_hcw", "sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_dark", "sap_horizon_dark_exp", "sap_horizon_exp", "sap_horizon_hcb", "sap_horizon_hcb_exp", "sap_horizon_hcw", "sap_horizon_hcw_exp"].forEach(themeName => (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", themeName, loadAndCheck));
});