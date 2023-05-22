sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/video", "./v5/video"], function (_exports, _Theme, _video, _video2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _video.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _video.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _video.pathData : _video2.pathData;
  _exports.pathData = pathData;
  var _default = "video";
  _exports.default = _default;
});