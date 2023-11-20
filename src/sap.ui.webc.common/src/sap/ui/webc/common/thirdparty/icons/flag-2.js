sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/flag-2", "./v5/flag-2"], function (_exports, _Theme, _flag, _flag2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _flag.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _flag.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _flag.pathData : _flag2.pathData;
  _exports.pathData = pathData;
  var _default = "flag-2";
  _exports.default = _default;
});