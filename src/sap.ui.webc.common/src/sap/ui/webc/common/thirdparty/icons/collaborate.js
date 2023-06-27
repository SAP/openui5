sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/collaborate", "./v5/collaborate"], function (_exports, _Theme, _collaborate, _collaborate2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _collaborate.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _collaborate.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _collaborate.pathData : _collaborate2.pathData;
  _exports.pathData = pathData;
  var _default = "collaborate";
  _exports.default = _default;
});