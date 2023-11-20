sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sys-find-next", "./v5/sys-find-next"], function (_exports, _Theme, _sysFindNext, _sysFindNext2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sysFindNext.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sysFindNext.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sysFindNext.pathData : _sysFindNext2.pathData;
  _exports.pathData = pathData;
  var _default = "sys-find-next";
  _exports.default = _default;
});