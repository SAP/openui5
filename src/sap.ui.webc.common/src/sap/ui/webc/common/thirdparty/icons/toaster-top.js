sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/toaster-top", "./v5/toaster-top"], function (_exports, _Theme, _toasterTop, _toasterTop2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _toasterTop.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _toasterTop.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _toasterTop.pathData : _toasterTop2.pathData;
  _exports.pathData = pathData;
  var _default = "toaster-top";
  _exports.default = _default;
});