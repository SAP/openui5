sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/applied_filter", "./v2/applied_filter"], function (_exports, _Theme, _applied_filter, _applied_filter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _applied_filter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _applied_filter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _applied_filter.pathData : _applied_filter2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/applied_filter";
  _exports.default = _default;
});