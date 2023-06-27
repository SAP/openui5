sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sys-minus", "./v5/sys-minus"], function (_exports, _Theme, _sysMinus, _sysMinus2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sysMinus.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sysMinus.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sysMinus.pathData : _sysMinus2.pathData;
  _exports.pathData = pathData;
  var _default = "sys-minus";
  _exports.default = _default;
});