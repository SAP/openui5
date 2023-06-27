sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/account", "./v5/account"], function (_exports, _Theme, _account, _account2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _account.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _account.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _account.pathData : _account2.pathData;
  _exports.pathData = pathData;
  var _default = "account";
  _exports.default = _default;
});