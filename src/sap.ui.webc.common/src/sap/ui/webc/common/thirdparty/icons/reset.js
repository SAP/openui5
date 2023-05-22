sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/reset", "./v5/reset"], function (_exports, _Theme, _reset, _reset2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _reset.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _reset.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _reset.pathData : _reset2.pathData;
  _exports.pathData = pathData;
  var _default = "reset";
  _exports.default = _default;
});