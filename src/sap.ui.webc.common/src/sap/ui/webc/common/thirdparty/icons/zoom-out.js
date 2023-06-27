sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/zoom-out", "./v5/zoom-out"], function (_exports, _Theme, _zoomOut, _zoomOut2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _zoomOut.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _zoomOut.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _zoomOut.pathData : _zoomOut2.pathData;
  _exports.pathData = pathData;
  var _default = "zoom-out";
  _exports.default = _default;
});