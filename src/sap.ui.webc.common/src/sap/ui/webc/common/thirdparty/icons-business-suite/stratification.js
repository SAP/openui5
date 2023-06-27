sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/stratification", "./v2/stratification"], function (_exports, _Theme, _stratification, _stratification2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _stratification.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _stratification.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _stratification.pathData : _stratification2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/stratification";
  _exports.default = _default;
});