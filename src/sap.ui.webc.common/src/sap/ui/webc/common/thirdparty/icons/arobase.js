sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/arobase", "./v5/arobase"], function (_exports, _Theme, _arobase, _arobase2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _arobase.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _arobase.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _arobase.pathData : _arobase2.pathData;
  _exports.pathData = pathData;
  var _default = "arobase";
  _exports.default = _default;
});