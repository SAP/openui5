sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/status-positive", "./v5/status-positive"], function (_exports, _Theme, _statusPositive, _statusPositive2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusPositive.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusPositive.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _statusPositive.pathData : _statusPositive2.pathData;
  _exports.pathData = pathData;
  var _default = "status-positive";
  _exports.default = _default;
});