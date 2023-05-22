sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/decrease", "./v2/decrease"], function (_exports, _Theme, _decrease, _decrease2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _decrease.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _decrease.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _decrease.pathData : _decrease2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/decrease";
  _exports.default = _default;
});