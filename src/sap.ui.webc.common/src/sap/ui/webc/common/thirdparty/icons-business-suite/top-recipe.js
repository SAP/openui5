sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/top-recipe", "./v2/top-recipe"], function (_exports, _Theme, _topRecipe, _topRecipe2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _topRecipe.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _topRecipe.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _topRecipe.pathData : _topRecipe2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/top-recipe";
  _exports.default = _default;
});