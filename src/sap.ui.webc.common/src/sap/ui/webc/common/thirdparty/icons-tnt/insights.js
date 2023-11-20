sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/insights", "./v3/insights"], function (_exports, _Theme, _insights, _insights2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _insights.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _insights.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _insights.pathData : _insights2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/insights";
  _exports.default = _default;
});