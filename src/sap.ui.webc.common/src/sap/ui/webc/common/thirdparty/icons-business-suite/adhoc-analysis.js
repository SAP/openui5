sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/adhoc-analysis", "./v2/adhoc-analysis"], function (_exports, _Theme, _adhocAnalysis, _adhocAnalysis2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _adhocAnalysis.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _adhocAnalysis.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _adhocAnalysis.pathData : _adhocAnalysis2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/adhoc-analysis";
  _exports.default = _default;
});