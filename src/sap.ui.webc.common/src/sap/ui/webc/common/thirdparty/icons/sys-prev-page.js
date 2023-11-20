sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sys-prev-page", "./v5/sys-prev-page"], function (_exports, _Theme, _sysPrevPage, _sysPrevPage2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sysPrevPage.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sysPrevPage.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sysPrevPage.pathData : _sysPrevPage2.pathData;
  _exports.pathData = pathData;
  var _default = "sys-prev-page";
  _exports.default = _default;
});