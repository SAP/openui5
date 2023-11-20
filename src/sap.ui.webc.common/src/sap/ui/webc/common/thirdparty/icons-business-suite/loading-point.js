sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/loading-point", "./v2/loading-point"], function (_exports, _Theme, _loadingPoint, _loadingPoint2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _loadingPoint.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _loadingPoint.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _loadingPoint.pathData : _loadingPoint2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/loading-point";
  _exports.default = _default;
});