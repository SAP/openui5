sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sound-loud", "./v5/sound-loud"], function (_exports, _Theme, _soundLoud, _soundLoud2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _soundLoud.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _soundLoud.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _soundLoud.pathData : _soundLoud2.pathData;
  _exports.pathData = pathData;
  var _default = "sound-loud";
  _exports.default = _default;
});