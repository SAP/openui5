sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/separator", "./v2/separator"], function (_exports, _Theme, _separator, _separator2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _separator.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _separator.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _separator.pathData : _separator2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/separator";
  _exports.default = _default;
});