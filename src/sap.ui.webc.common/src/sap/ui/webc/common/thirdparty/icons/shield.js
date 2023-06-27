sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/shield", "./v5/shield"], function (_exports, _Theme, _shield, _shield2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _shield.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _shield.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _shield.pathData : _shield2.pathData;
  _exports.pathData = pathData;
  var _default = "shield";
  _exports.default = _default;
});