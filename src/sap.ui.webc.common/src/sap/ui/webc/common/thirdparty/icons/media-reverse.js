sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/media-reverse", "./v5/media-reverse"], function (_exports, _Theme, _mediaReverse, _mediaReverse2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mediaReverse.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mediaReverse.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mediaReverse.pathData : _mediaReverse2.pathData;
  _exports.pathData = pathData;
  var _default = "media-reverse";
  _exports.default = _default;
});