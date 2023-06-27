sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/header", "./v5/header"], function (_exports, _Theme, _header, _header2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _header.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _header.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _header.pathData : _header2.pathData;
  _exports.pathData = pathData;
  var _default = "header";
  _exports.default = _default;
});