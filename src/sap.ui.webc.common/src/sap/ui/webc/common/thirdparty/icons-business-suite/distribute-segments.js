sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/distribute-segments", "./v2/distribute-segments"], function (_exports, _Theme, _distributeSegments, _distributeSegments2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _distributeSegments.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _distributeSegments.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _distributeSegments.pathData : _distributeSegments2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/distribute-segments";
  _exports.default = _default;
});