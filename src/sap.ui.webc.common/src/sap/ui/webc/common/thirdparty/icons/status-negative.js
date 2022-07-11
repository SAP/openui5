sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/status-negative", "./v4/status-negative"], function (_exports, _Theme, _statusNegative, _statusNegative2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusNegative.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusNegative.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _statusNegative.pathData : _statusNegative2.pathData;
  _exports.pathData = pathData;
  var _default = "status-negative";
  _exports.default = _default;
});