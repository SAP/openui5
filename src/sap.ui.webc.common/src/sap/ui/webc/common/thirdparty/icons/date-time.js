sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/date-time", "./v5/date-time"], function (_exports, _Theme, _dateTime, _dateTime2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dateTime.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dateTime.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dateTime.pathData : _dateTime2.pathData;
  _exports.pathData = pathData;
  var _default = "date-time";
  _exports.default = _default;
});