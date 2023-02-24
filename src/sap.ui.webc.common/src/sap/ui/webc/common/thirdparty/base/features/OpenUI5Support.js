sap.ui.define(["../FeaturesRegistry", "../config/Theme", "../util/PopupUtils"], function (_FeaturesRegistry, _Theme, _PopupUtils) {
  "use strict";

  const getCore = () => {
    const sap = window.sap;
    const core = sap && sap.ui && typeof sap.ui.getCore === "function" && sap.ui.getCore();
    return core;
  };
  const isLoaded = () => {
    return !!getCore();
  };
  const init = () => {
    const core = getCore();
    if (!core) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      core.attachInit(() => {
        window.sap.ui.require(["sap/ui/core/LocaleData", "sap/ui/core/Popup"], (LocaleData, Popup) => {
          Popup.setInitialZIndex((0, _PopupUtils.getCurrentZIndex)());
          resolve();
        });
      });
    });
  };
  const getConfigurationSettingsObject = () => {
    const core = getCore();
    if (!core) {
      return;
    }
    const config = core.getConfiguration();
    const LocaleData = window.sap.ui.require("sap/ui/core/LocaleData");
    return {
      animationMode: config.getAnimationMode(),
      language: config.getLanguage(),
      theme: config.getTheme(),
      rtl: config.getRTL(),
      calendarType: config.getCalendarType(),
      formatSettings: {
        firstDayOfWeek: LocaleData ? LocaleData.getInstance(config.getLocale()).getFirstDayOfWeek() : undefined
      }
    };
  };
  const getLocaleDataObject = () => {
    const core = getCore();
    if (!core) {
      return;
    }
    const config = core.getConfiguration();
    const LocaleData = window.sap.ui.require("sap/ui/core/LocaleData");
    return LocaleData.getInstance(config.getLocale())._get();
  };
  const listenForThemeChange = () => {
    const core = getCore();
    const config = core.getConfiguration();
    core.attachThemeChanged(async () => {
      await (0, _Theme.setTheme)(config.getTheme());
    });
  };
  const attachListeners = () => {
    const core = getCore();
    if (!core) {
      return;
    }
    listenForThemeChange();
  };
  const cssVariablesLoaded = () => {
    const core = getCore();
    if (!core) {
      return;
    }
    const link = [...document.head.children].find(el => el.id === "sap-ui-theme-sap.ui.core"); // more reliable than querySelector early
    if (!link) {
      return;
    }
    return !!link.href.match(/\/css(-|_)variables\.css/);
  };
  const getNextZIndex = () => {
    const core = getCore();
    if (!core) {
      return;
    }
    const Popup = window.sap.ui.require("sap/ui/core/Popup");
    return Popup.getNextZIndex();
  };
  const setInitialZIndex = () => {
    const core = getCore();
    if (!core) {
      return;
    }
    const Popup = window.sap.ui.require("sap/ui/core/Popup");
    Popup.setInitialZIndex((0, _PopupUtils.getCurrentZIndex)());
  };
  const OpenUI5Support = {
    isLoaded,
    init,
    getConfigurationSettingsObject,
    getLocaleDataObject,
    attachListeners,
    cssVariablesLoaded,
    getNextZIndex,
    setInitialZIndex
  };
  (0, _FeaturesRegistry.registerFeature)("OpenUI5Support", OpenUI5Support);
});