sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/camera", "./v5/camera"], function (_exports, _Theme, _camera, _camera2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _camera.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _camera.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _camera.pathData : _camera2.pathData;
  _exports.pathData = pathData;
  var _default = "camera";
  _exports.default = _default;
});