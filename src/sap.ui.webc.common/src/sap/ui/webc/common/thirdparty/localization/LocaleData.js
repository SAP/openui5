sap.ui.define(["exports", "sap/ui/core/LocaleData"], function (_exports, _LocaleData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _LocaleData = _interopRequireDefault(_LocaleData);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // @ts-ignore

  const LocaleDataWrapped = _LocaleData.default;
  class LocaleData extends LocaleDataWrapped {}
  var _default = LocaleData;
  _exports.default = _default;
});