sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/status-in-process", "./v5/status-in-process"], function (_exports, _Theme, _statusInProcess, _statusInProcess2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _statusInProcess.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _statusInProcess.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _statusInProcess.pathData : _statusInProcess2.pathData;
  _exports.pathData = pathData;
  var _default = "status-in-process";
  _exports.default = _default;
});