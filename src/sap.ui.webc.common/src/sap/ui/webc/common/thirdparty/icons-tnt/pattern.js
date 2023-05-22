sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/pattern", "./v3/pattern"], function (_exports, _Theme, _pattern, _pattern2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pattern.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pattern.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pattern.pathData : _pattern2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/pattern";
  _exports.default = _default;
});