sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/polygon-black", "./v2/polygon-black"], function (_exports, _Theme, _polygonBlack, _polygonBlack2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _polygonBlack.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _polygonBlack.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _polygonBlack.pathData : _polygonBlack2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/polygon-black";
  _exports.default = _default;
});