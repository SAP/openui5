sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/late", "./v2/late"], function (_exports, _Theme, _late, _late2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _late.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _late.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _late.pathData : _late2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/late";
  _exports.default = _default;
});