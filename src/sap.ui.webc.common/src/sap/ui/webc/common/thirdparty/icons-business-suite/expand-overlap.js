sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/expand-overlap", "./v2/expand-overlap"], function (_exports, _Theme, _expandOverlap, _expandOverlap2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _expandOverlap.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _expandOverlap.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _expandOverlap.pathData : _expandOverlap2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/expand-overlap";
  _exports.default = _default;
});