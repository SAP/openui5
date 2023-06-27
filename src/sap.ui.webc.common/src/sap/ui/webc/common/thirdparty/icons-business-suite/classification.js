sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/classification", "./v2/classification"], function (_exports, _Theme, _classification, _classification2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _classification.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _classification.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _classification.pathData : _classification2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/classification";
  _exports.default = _default;
});