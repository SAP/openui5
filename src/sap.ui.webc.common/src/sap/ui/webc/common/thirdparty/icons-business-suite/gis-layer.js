sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/gis-layer", "./v2/gis-layer"], function (_exports, _Theme, _gisLayer, _gisLayer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _gisLayer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _gisLayer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _gisLayer.pathData : _gisLayer2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/gis-layer";
  _exports.default = _default;
});