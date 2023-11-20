sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/separate-segments", "./v2/separate-segments"], function (_exports, _Theme, _separateSegments, _separateSegments2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _separateSegments.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _separateSegments.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _separateSegments.pathData : _separateSegments2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/separate-segments";
  _exports.default = _default;
});