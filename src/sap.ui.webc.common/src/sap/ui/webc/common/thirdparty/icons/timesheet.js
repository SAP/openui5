sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/timesheet", "./v5/timesheet"], function (_exports, _Theme, _timesheet, _timesheet2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _timesheet.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _timesheet.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _timesheet.pathData : _timesheet2.pathData;
  _exports.pathData = pathData;
  var _default = "timesheet";
  _exports.default = _default;
});