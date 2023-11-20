sap.ui.define(["exports", "sap/ui/core/date/UI5Date"], function (_exports, _UI5Date) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Date = _interopRequireDefault(_UI5Date);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // @ts-ignore

  const UI5DateWrapped = _UI5Date.default;
  class UI5Date extends UI5DateWrapped {}
  var _default = UI5Date;
  _exports.default = _default;
});