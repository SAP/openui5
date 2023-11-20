sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/year", "./v2/year"], function (_exports, _Theme, _year, _year2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _year.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _year.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _year.pathData : _year2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/year";
  _exports.default = _default;
});