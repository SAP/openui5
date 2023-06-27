sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/code1", "./v3/code1"], function (_exports, _Theme, _code, _code2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _code.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _code.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _code.pathData : _code2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/code1";
  _exports.default = _default;
});