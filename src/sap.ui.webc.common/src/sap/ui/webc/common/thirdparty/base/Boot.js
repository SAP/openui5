sap.ui.define(["exports", "./util/whenDOMReady", "./EventProvider", "./FontFace", "./SystemCSSVars", "./config/Theme", "./theming/applyTheme", "./Runtimes", "./FeaturesRegistry", "./theming/ThemeRegistered"], function (_exports, _whenDOMReady, _EventProvider, _FontFace, _SystemCSSVars, _Theme, _applyTheme, _Runtimes, _FeaturesRegistry, _ThemeRegistered) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.boot = _exports.attachBoot = void 0;
  _whenDOMReady = _interopRequireDefault(_whenDOMReady);
  _EventProvider = _interopRequireDefault(_EventProvider);
  _FontFace = _interopRequireDefault(_FontFace);
  _SystemCSSVars = _interopRequireDefault(_SystemCSSVars);
  _applyTheme = _interopRequireDefault(_applyTheme);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let booted = false;
  let bootPromise;
  const eventProvider = new _EventProvider.default();
  /**
   * Attaches a callback that will be executed after boot finishes.
   * <b>Note:</b> If the framework already booted, the callback will be immediately executed.
   * @public
   * @param { Function } listener
   */
  const attachBoot = listener => {
    if (!booted) {
      eventProvider.attachEvent("boot", listener);
      return;
    }
    listener();
  };
  _exports.attachBoot = attachBoot;
  const boot = async () => {
    if (bootPromise !== undefined) {
      return bootPromise;
    }
    const bootExecutor = async resolve => {
      if (typeof document === "undefined") {
        resolve();
        return;
      }
      (0, _ThemeRegistered.attachThemeRegistered)(onThemeRegistered);
      (0, _Runtimes.registerCurrentRuntime)();
      const openUI5Support = (0, _FeaturesRegistry.getFeature)("OpenUI5Support");
      const isOpenUI5Loaded = openUI5Support ? openUI5Support.isOpenUI5Detected() : false;
      const f6Navigation = (0, _FeaturesRegistry.getFeature)("F6Navigation");
      if (openUI5Support) {
        await openUI5Support.init();
      }
      if (f6Navigation && !isOpenUI5Loaded) {
        f6Navigation.init();
      }
      await (0, _whenDOMReady.default)();
      await (0, _applyTheme.default)((0, _Theme.getTheme)());
      openUI5Support && openUI5Support.attachListeners();
      (0, _FontFace.default)();
      (0, _SystemCSSVars.default)();
      resolve();
      booted = true;
      await eventProvider.fireEventAsync("boot");
    };
    bootPromise = new Promise(bootExecutor);
    return bootPromise;
  };
  /**
   * Callback, executed after theme properties registration
   * to apply the newly registered theme.
   * @private
   * @param { string } theme
   */
  _exports.boot = boot;
  const onThemeRegistered = theme => {
    const currentTheme = (0, _Theme.getTheme)();
    if (booted && theme === currentTheme) {
      (0, _applyTheme.default)(currentTheme);
    }
  };
});