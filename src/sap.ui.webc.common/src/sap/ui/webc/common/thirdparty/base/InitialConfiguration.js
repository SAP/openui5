sap.ui.define(["exports", "./thirdparty/merge", "./FeaturesRegistry", "./generated/AssetParameters", "./validateThemeRoot", "./types/AnimationMode"], function (_exports, _merge, _FeaturesRegistry, _AssetParameters, _validateThemeRoot, _AnimationMode) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getTimezone = _exports.getThemeRoot = _exports.getTheme = _exports.getSecondaryCalendarType = _exports.getRTL = _exports.getNoConflict = _exports.getLanguage = _exports.getFormatSettings = _exports.getFetchDefaultLanguage = _exports.getCalendarType = _exports.getAnimationMode = void 0;
  _merge = _interopRequireDefault(_merge);
  _validateThemeRoot = _interopRequireDefault(_validateThemeRoot);
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let initialized = false;
  let initialConfig = {
    animationMode: _AnimationMode.default.Full,
    theme: _AssetParameters.DEFAULT_THEME,
    themeRoot: undefined,
    rtl: undefined,
    language: undefined,
    timezone: undefined,
    calendarType: undefined,
    secondaryCalendarType: undefined,
    noConflict: false,
    formatSettings: {},
    fetchDefaultLanguage: false
  };
  /* General settings */
  const getAnimationMode = () => {
    initConfiguration();
    return initialConfig.animationMode;
  };
  _exports.getAnimationMode = getAnimationMode;
  const getTheme = () => {
    initConfiguration();
    return initialConfig.theme;
  };
  _exports.getTheme = getTheme;
  const getThemeRoot = () => {
    initConfiguration();
    return initialConfig.themeRoot;
  };
  _exports.getThemeRoot = getThemeRoot;
  const getRTL = () => {
    initConfiguration();
    return initialConfig.rtl;
  };
  _exports.getRTL = getRTL;
  const getLanguage = () => {
    initConfiguration();
    return initialConfig.language;
  };
  /**
   * Returns if the default language, that is inlined at build time,
   * should be fetched over the network instead.
   * @returns {Boolean}
   */
  _exports.getLanguage = getLanguage;
  const getFetchDefaultLanguage = () => {
    initConfiguration();
    return initialConfig.fetchDefaultLanguage;
  };
  _exports.getFetchDefaultLanguage = getFetchDefaultLanguage;
  const getNoConflict = () => {
    initConfiguration();
    return initialConfig.noConflict;
  };
  /**
   * Get the configured calendar type
   * @returns { String } the name of the configured calendar type
   */
  _exports.getNoConflict = getNoConflict;
  const getCalendarType = () => {
    initConfiguration();
    return initialConfig.calendarType;
  };
  _exports.getCalendarType = getCalendarType;
  const getSecondaryCalendarType = () => {
    initConfiguration();
    return initialConfig.secondaryCalendarType;
  };
  /**
   * Returns the configured IANA timezone ID.
   * @returns { String } the configured IANA timezone ID, e.g. "America/New_York"
   */
  _exports.getSecondaryCalendarType = getSecondaryCalendarType;
  const getTimezone = () => {
    initConfiguration();
    return initialConfig.timezone;
  };
  _exports.getTimezone = getTimezone;
  const getFormatSettings = () => {
    initConfiguration();
    return initialConfig.formatSettings;
  };
  _exports.getFormatSettings = getFormatSettings;
  const booleanMapping = new Map();
  booleanMapping.set("true", true);
  booleanMapping.set("false", false);
  const parseConfigurationScript = () => {
    const configScript = document.querySelector("[data-ui5-config]") || document.querySelector("[data-id='sap-ui-config']"); // for backward compatibility
    let configJSON;
    if (configScript) {
      try {
        configJSON = JSON.parse(configScript.innerHTML);
      } catch (err) {
        console.warn("Incorrect data-sap-ui-config format. Please use JSON"); /* eslint-disable-line */
      }

      if (configJSON) {
        initialConfig = (0, _merge.default)(initialConfig, configJSON);
      }
    }
  };
  const parseURLParameters = () => {
    const params = new URLSearchParams(window.location.search);
    // Process "sap-*" params first
    params.forEach((value, key) => {
      const parts = key.split("sap-").length;
      if (parts === 0 || parts === key.split("sap-ui-").length) {
        return;
      }
      applyURLParam(key, value, "sap");
    });
    // Process "sap-ui-*" params
    params.forEach((value, key) => {
      if (!key.startsWith("sap-ui")) {
        return;
      }
      applyURLParam(key, value, "sap-ui");
    });
  };
  const normalizeThemeRootParamValue = value => {
    const themeRoot = value.split("@")[1];
    return (0, _validateThemeRoot.default)(themeRoot);
  };
  const normalizeThemeParamValue = (param, value) => {
    if (param === "theme" && value.includes("@")) {
      // the theme parameter might have @<URL-TO-THEME> in the value - strip this
      return value.split("@")[0];
    }
    return value;
  };
  const applyURLParam = (key, value, paramType) => {
    const lowerCaseValue = value.toLowerCase();
    const param = key.split(`${paramType}-`)[1];
    if (booleanMapping.has(value)) {
      value = booleanMapping.get(lowerCaseValue);
    }
    if (param === "theme") {
      initialConfig.theme = normalizeThemeParamValue(param, value);
      if (value && value.includes("@")) {
        initialConfig.themeRoot = normalizeThemeRootParamValue(value);
      }
    } else {
      initialConfig[param] = value;
    }
  };
  const applyOpenUI5Configuration = () => {
    const openUI5Support = (0, _FeaturesRegistry.getFeature)("OpenUI5Support");
    if (!openUI5Support || !openUI5Support.isOpenUI5Detected()) {
      return;
    }
    const OpenUI5Config = openUI5Support.getConfigurationSettingsObject();
    initialConfig = (0, _merge.default)(initialConfig, OpenUI5Config);
  };
  const initConfiguration = () => {
    if (typeof document === "undefined" || initialized) {
      return;
    }
    // 1. Lowest priority - configuration script
    parseConfigurationScript();
    // 2. URL parameters overwrite configuration script parameters
    parseURLParameters();
    // 3. If OpenUI5 is detected, it has the highest priority
    applyOpenUI5Configuration();
    initialized = true;
  };
});