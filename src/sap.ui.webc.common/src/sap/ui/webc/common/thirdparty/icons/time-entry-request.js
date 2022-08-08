sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/time-entry-request", "./v4/time-entry-request"], function (_exports, _Theme, _timeEntryRequest, _timeEntryRequest2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _timeEntryRequest.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _timeEntryRequest.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _timeEntryRequest.pathData : _timeEntryRequest2.pathData;
  _exports.pathData = pathData;
  var _default = "time-entry-request";
  _exports.default = _default;
});