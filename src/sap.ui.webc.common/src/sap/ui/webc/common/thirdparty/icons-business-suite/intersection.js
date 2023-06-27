sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/intersection", "./v2/intersection"], function (_exports, _Theme, _intersection, _intersection2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _intersection.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _intersection.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _intersection.pathData : _intersection2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/intersection";
  _exports.default = _default;
});