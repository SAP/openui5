sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/monitor-payments", "./v5/monitor-payments"], function (_exports, _Theme, _monitorPayments, _monitorPayments2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _monitorPayments.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _monitorPayments.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _monitorPayments.pathData : _monitorPayments2.pathData;
  _exports.pathData = pathData;
  var _default = "monitor-payments";
  _exports.default = _default;
});