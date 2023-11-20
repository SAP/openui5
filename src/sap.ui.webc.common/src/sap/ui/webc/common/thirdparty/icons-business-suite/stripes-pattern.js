sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/stripes-pattern", "./v2/stripes-pattern"], function (_exports, _Theme, _stripesPattern, _stripesPattern2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _stripesPattern.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _stripesPattern.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _stripesPattern.pathData : _stripesPattern2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/stripes-pattern";
  _exports.default = _default;
});