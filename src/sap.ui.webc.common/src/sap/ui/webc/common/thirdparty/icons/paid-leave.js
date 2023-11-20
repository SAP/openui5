sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/paid-leave", "./v5/paid-leave"], function (_exports, _Theme, _paidLeave, _paidLeave2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _paidLeave.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _paidLeave.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _paidLeave.pathData : _paidLeave2.pathData;
  _exports.pathData = pathData;
  var _default = "paid-leave";
  _exports.default = _default;
});