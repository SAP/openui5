sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/integer", "./v3/integer"], function (_exports, _Theme, _integer, _integer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _integer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _integer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _integer.pathData : _integer2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/integer";
  _exports.default = _default;
});