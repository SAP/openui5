sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sys-last-page", "./v5/sys-last-page"], function (_exports, _Theme, _sysLastPage, _sysLastPage2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sysLastPage.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sysLastPage.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sysLastPage.pathData : _sysLastPage2.pathData;
  _exports.pathData = pathData;
  var _default = "sys-last-page";
  _exports.default = _default;
});