sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/escalation-end-event", "./v3/escalation-end-event"], function (_exports, _Theme, _escalationEndEvent, _escalationEndEvent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _escalationEndEvent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _escalationEndEvent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _escalationEndEvent.pathData : _escalationEndEvent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/escalation-end-event";
  _exports.default = _default;
});