sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/keep-segment", "./v2/keep-segment"], function (_exports, _Theme, _keepSegment, _keepSegment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _keepSegment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _keepSegment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _keepSegment.pathData : _keepSegment2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/keep-segment";
  _exports.default = _default;
});