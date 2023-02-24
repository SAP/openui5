sap.ui.define(["exports", "../EventProvider"], function (_exports, _EventProvider) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.fireLanguageChange = _exports.detachLanguageChange = _exports.attachLanguageChange = void 0;
  _EventProvider = _interopRequireDefault(_EventProvider);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const eventProvider = new _EventProvider.default();
  const LANG_CHANGE = "languageChange";
  const attachLanguageChange = listener => {
    eventProvider.attachEvent(LANG_CHANGE, listener);
  };
  _exports.attachLanguageChange = attachLanguageChange;
  const detachLanguageChange = listener => {
    eventProvider.detachEvent(LANG_CHANGE, listener);
  };
  _exports.detachLanguageChange = detachLanguageChange;
  const fireLanguageChange = lang => {
    return eventProvider.fireEventAsync(LANG_CHANGE, lang);
  };
  _exports.fireLanguageChange = fireLanguageChange;
});