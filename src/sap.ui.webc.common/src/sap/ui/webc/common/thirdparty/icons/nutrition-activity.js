sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/nutrition-activity", "./v5/nutrition-activity"], function (_exports, _Theme, _nutritionActivity, _nutritionActivity2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _nutritionActivity.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _nutritionActivity.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _nutritionActivity.pathData : _nutritionActivity2.pathData;
  _exports.pathData = pathData;
  var _default = "nutrition-activity";
  _exports.default = _default;
});