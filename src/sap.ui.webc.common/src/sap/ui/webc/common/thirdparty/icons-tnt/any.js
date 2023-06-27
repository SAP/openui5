sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/any", "./v3/any"], function (_exports, _Theme, _any, _any2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _any.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _any.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _any.pathData : _any2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/any";
  _exports.default = _default;
});