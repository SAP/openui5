sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/time-account", "./v5/time-account"], function (_exports, _Theme, _timeAccount, _timeAccount2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _timeAccount.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _timeAccount.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _timeAccount.pathData : _timeAccount2.pathData;
  _exports.pathData = pathData;
  var _default = "time-account";
  _exports.default = _default;
});