sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/supplier", "./v5/supplier"], function (_exports, _Theme, _supplier, _supplier2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _supplier.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _supplier.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _supplier.pathData : _supplier2.pathData;
  _exports.pathData = pathData;
  var _default = "supplier";
  _exports.default = _default;
});