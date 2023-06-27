sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/collapse-overlap", "./v2/collapse-overlap"], function (_exports, _Theme, _collapseOverlap, _collapseOverlap2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _collapseOverlap.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _collapseOverlap.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _collapseOverlap.pathData : _collapseOverlap2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/collapse-overlap";
  _exports.default = _default;
});