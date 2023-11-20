sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/receipt", "./v5/receipt"], function (_exports, _Theme, _receipt, _receipt2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _receipt.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _receipt.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _receipt.pathData : _receipt2.pathData;
  _exports.pathData = pathData;
  var _default = "receipt";
  _exports.default = _default;
});