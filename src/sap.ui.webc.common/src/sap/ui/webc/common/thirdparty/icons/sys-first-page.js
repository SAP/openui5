sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sys-first-page", "./v5/sys-first-page"], function (_exports, _Theme, _sysFirstPage, _sysFirstPage2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sysFirstPage.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sysFirstPage.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sysFirstPage.pathData : _sysFirstPage2.pathData;
  _exports.pathData = pathData;
  var _default = "sys-first-page";
  _exports.default = _default;
});