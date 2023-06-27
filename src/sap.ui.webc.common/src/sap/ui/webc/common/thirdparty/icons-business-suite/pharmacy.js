sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/pharmacy", "./v2/pharmacy"], function (_exports, _Theme, _pharmacy, _pharmacy2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pharmacy.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pharmacy.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pharmacy.pathData : _pharmacy2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/pharmacy";
  _exports.default = _default;
});