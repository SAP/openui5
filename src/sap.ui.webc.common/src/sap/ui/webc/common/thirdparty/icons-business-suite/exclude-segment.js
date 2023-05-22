sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/exclude-segment", "./v2/exclude-segment"], function (_exports, _Theme, _excludeSegment, _excludeSegment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _excludeSegment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _excludeSegment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _excludeSegment.pathData : _excludeSegment2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/exclude-segment";
  _exports.default = _default;
});