sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/polygon", "./v2/polygon"], function (_exports, _Theme, _polygon, _polygon2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _polygon.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _polygon.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _polygon.pathData : _polygon2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/polygon";
  _exports.default = _default;
});