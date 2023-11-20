sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/change-log", "./v2/change-log"], function (_exports, _Theme, _changeLog, _changeLog2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _changeLog.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _changeLog.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _changeLog.pathData : _changeLog2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/change-log";
  _exports.default = _default;
});