sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/blur", "./v5/blur"], function (_exports, _Theme, _blur, _blur2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _blur.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _blur.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _blur.pathData : _blur2.pathData;
  _exports.pathData = pathData;
  var _default = "blur";
  _exports.default = _default;
});