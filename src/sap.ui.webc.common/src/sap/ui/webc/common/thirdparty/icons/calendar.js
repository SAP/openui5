sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/calendar", "./v5/calendar"], function (_exports, _Theme, _calendar, _calendar2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _calendar.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _calendar.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _calendar.pathData : _calendar2.pathData;
  _exports.pathData = pathData;
  var _default = "calendar";
  _exports.default = _default;
});