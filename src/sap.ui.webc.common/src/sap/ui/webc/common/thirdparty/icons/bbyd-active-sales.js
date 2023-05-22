sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/bbyd-active-sales", "./v5/bbyd-active-sales"], function (_exports, _Theme, _bbydActiveSales, _bbydActiveSales2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bbydActiveSales.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bbydActiveSales.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bbydActiveSales.pathData : _bbydActiveSales2.pathData;
  _exports.pathData = pathData;
  var _default = "bbyd-active-sales";
  _exports.default = _default;
});