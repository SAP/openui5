sap.ui.define(["exports", "../EventProvider"], function (_exports, _EventProvider) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.fireThemeLoaded = _exports.detachThemeLoaded = _exports.attachThemeLoaded = void 0;
  _EventProvider = _interopRequireDefault(_EventProvider);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const eventProvider = new _EventProvider.default();
  const THEME_LOADED = "themeLoaded";
  const attachThemeLoaded = listener => {
    eventProvider.attachEvent(THEME_LOADED, listener);
  };
  _exports.attachThemeLoaded = attachThemeLoaded;
  const detachThemeLoaded = listener => {
    eventProvider.detachEvent(THEME_LOADED, listener);
  };
  _exports.detachThemeLoaded = detachThemeLoaded;
  const fireThemeLoaded = theme => {
    return eventProvider.fireEvent(THEME_LOADED, theme);
  };
  _exports.fireThemeLoaded = fireThemeLoaded;
});