sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/road", "./v2/road"], function (_exports, _Theme, _road, _road2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _road.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _road.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _road.pathData : _road2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/road";
  _exports.default = _default;
});