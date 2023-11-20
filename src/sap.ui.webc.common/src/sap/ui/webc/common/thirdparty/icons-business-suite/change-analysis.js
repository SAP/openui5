sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/change-analysis", "./v2/change-analysis"], function (_exports, _Theme, _changeAnalysis, _changeAnalysis2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _changeAnalysis.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _changeAnalysis.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _changeAnalysis.pathData : _changeAnalysis2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/change-analysis";
  _exports.default = _default;
});