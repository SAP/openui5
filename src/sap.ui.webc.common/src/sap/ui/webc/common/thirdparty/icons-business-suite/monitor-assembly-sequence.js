sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/monitor-assembly-sequence", "./v2/monitor-assembly-sequence"], function (_exports, _Theme, _monitorAssemblySequence, _monitorAssemblySequence2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _monitorAssemblySequence.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _monitorAssemblySequence.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _monitorAssemblySequence.pathData : _monitorAssemblySequence2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/monitor-assembly-sequence";
  _exports.default = _default;
});