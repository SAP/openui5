sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/web-cam", "./v5/web-cam"], function (_exports, _Theme, _webCam, _webCam2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _webCam.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _webCam.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _webCam.pathData : _webCam2.pathData;
  _exports.pathData = pathData;
  var _default = "web-cam";
  _exports.default = _default;
});