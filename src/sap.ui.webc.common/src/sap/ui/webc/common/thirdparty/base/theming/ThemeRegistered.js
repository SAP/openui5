sap.ui.define(["exports", "../EventProvider"], function (_exports, _EventProvider) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.fireThemeRegistered = _exports.attachThemeRegistered = void 0;
  _EventProvider = _interopRequireDefault(_EventProvider);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const eventProvider = new _EventProvider.default();
  const THEME_REGISTERED = "themeRegistered";
  const attachThemeRegistered = listener => {
    eventProvider.attachEvent(THEME_REGISTERED, listener);
  };
  _exports.attachThemeRegistered = attachThemeRegistered;
  const fireThemeRegistered = theme => {
    return eventProvider.fireEvent(THEME_REGISTERED, theme);
  };
  _exports.fireThemeRegistered = fireThemeRegistered;
});