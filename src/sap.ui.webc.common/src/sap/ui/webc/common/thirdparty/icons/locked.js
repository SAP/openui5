sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/locked", "./v5/locked"], function (_exports, _Theme, _locked, _locked2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _locked.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _locked.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _locked.pathData : _locked2.pathData;
  _exports.pathData = pathData;
  var _default = "locked";
  _exports.default = _default;
});