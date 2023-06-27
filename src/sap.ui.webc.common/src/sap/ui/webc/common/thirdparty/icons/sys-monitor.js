sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sys-monitor", "./v5/sys-monitor"], function (_exports, _Theme, _sysMonitor, _sysMonitor2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sysMonitor.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sysMonitor.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sysMonitor.pathData : _sysMonitor2.pathData;
  _exports.pathData = pathData;
  var _default = "sys-monitor";
  _exports.default = _default;
});