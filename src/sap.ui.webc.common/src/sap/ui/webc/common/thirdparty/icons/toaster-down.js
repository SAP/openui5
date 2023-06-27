sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/toaster-down", "./v5/toaster-down"], function (_exports, _Theme, _toasterDown, _toasterDown2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _toasterDown.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _toasterDown.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _toasterDown.pathData : _toasterDown2.pathData;
  _exports.pathData = pathData;
  var _default = "toaster-down";
  _exports.default = _default;
});