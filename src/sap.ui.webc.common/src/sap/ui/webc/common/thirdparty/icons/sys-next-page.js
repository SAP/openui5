sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sys-next-page", "./v5/sys-next-page"], function (_exports, _Theme, _sysNextPage, _sysNextPage2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sysNextPage.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sysNextPage.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sysNextPage.pathData : _sysNextPage2.pathData;
  _exports.pathData = pathData;
  var _default = "sys-next-page";
  _exports.default = _default;
});