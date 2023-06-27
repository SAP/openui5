sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/wallet", "./v5/wallet"], function (_exports, _Theme, _wallet, _wallet2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _wallet.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _wallet.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _wallet.pathData : _wallet2.pathData;
  _exports.pathData = pathData;
  var _default = "wallet";
  _exports.default = _default;
});