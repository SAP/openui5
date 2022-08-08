sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/trip-report", "./v4/trip-report"], function (_exports, _Theme, _tripReport, _tripReport2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tripReport.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tripReport.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _tripReport.pathData : _tripReport2.pathData;
  _exports.pathData = pathData;
  var _default = "trip-report";
  _exports.default = _default;
});