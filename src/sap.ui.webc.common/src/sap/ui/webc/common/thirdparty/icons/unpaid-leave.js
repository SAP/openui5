sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/unpaid-leave", "./v5/unpaid-leave"], function (_exports, _Theme, _unpaidLeave, _unpaidLeave2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _unpaidLeave.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _unpaidLeave.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _unpaidLeave.pathData : _unpaidLeave2.pathData;
  _exports.pathData = pathData;
  var _default = "unpaid-leave";
  _exports.default = _default;
});