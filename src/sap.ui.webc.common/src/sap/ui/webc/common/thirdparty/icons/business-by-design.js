sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/business-by-design", "./v5/business-by-design"], function (_exports, _Theme, _businessByDesign, _businessByDesign2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessByDesign.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessByDesign.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessByDesign.pathData : _businessByDesign2.pathData;
  _exports.pathData = pathData;
  var _default = "business-by-design";
  _exports.default = _default;
});