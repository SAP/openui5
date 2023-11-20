sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/permission", "./v5/permission"], function (_exports, _Theme, _permission, _permission2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _permission.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _permission.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _permission.pathData : _permission2.pathData;
  _exports.pathData = pathData;
  var _default = "permission";
  _exports.default = _default;
});