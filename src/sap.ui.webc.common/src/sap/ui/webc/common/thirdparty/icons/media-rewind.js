sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/media-rewind", "./v5/media-rewind"], function (_exports, _Theme, _mediaRewind, _mediaRewind2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mediaRewind.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mediaRewind.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mediaRewind.pathData : _mediaRewind2.pathData;
  _exports.pathData = pathData;
  var _default = "media-rewind";
  _exports.default = _default;
});