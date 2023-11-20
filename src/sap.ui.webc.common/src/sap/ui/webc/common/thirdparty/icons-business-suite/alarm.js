sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/alarm", "./v2/alarm"], function (_exports, _Theme, _alarm, _alarm2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _alarm.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _alarm.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _alarm.pathData : _alarm2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/alarm";
  _exports.default = _default;
});