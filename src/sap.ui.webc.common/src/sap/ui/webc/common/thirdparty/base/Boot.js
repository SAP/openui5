sap.ui.define(["exports", "./util/whenDOMReady", "./FontFace", "./SystemCSSVars", "./config/Theme", "./theming/applyTheme", "./Runtimes", "./FeaturesRegistry"], function (_exports, _whenDOMReady, _FontFace, _SystemCSSVars, _Theme, _applyTheme, _Runtimes, _FeaturesRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.boot = _exports.attachBoot = void 0;
  _whenDOMReady = _interopRequireDefault(_whenDOMReady);
  _FontFace = _interopRequireDefault(_FontFace);
  _SystemCSSVars = _interopRequireDefault(_SystemCSSVars);
  _applyTheme = _interopRequireDefault(_applyTheme);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let bootPromise;

  /**
   * Attach a callback that will be executed on boot
   * @public
   * @param listener
   */
  const attachBoot = async listener => {
    await boot();
    listener();
  };
  _exports.attachBoot = attachBoot;
  const boot = async () => {
    if (bootPromise) {
      return bootPromise;
    }

    /* eslint-disable no-alert, no-async-promise-executor */
    /*
    	Note(since we disable eslint rule):
    	If an async executor function throws an error, the error will be lost and won't cause the newly-constructed Promise to reject.
    	This could make it difficult to debug and handle some errors.
    */
    bootPromise = new Promise(async resolve => {
      (0, _Runtimes.registerCurrentRuntime)();
      const OpenUI5Support = (0, _FeaturesRegistry.getFeature)("OpenUI5Support");
      const F6Navigation = (0, _FeaturesRegistry.getFeature)("F6Navigation");
      if (OpenUI5Support) {
        await OpenUI5Support.init();
      } else if (F6Navigation) {
        F6Navigation.init();
      }
      await (0, _whenDOMReady.default)();
      await (0, _applyTheme.default)((0, _Theme.getTheme)());
      OpenUI5Support && OpenUI5Support.attachListeners();
      (0, _FontFace.default)();
      (0, _SystemCSSVars.default)();
      resolve();
    });
    /* eslint-enable no-alert, no-async-promise-executor */

    return bootPromise;
  };
  _exports.boot = boot;
});