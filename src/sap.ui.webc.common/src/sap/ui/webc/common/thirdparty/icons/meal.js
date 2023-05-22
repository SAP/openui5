sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/meal", "./v5/meal"], function (_exports, _Theme, _meal, _meal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _meal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _meal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _meal.pathData : _meal2.pathData;
  _exports.pathData = pathData;
  var _default = "meal";
  _exports.default = _default;
});