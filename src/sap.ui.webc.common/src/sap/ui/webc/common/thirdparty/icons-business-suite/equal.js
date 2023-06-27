sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/equal", "./v2/equal"], function (_exports, _Theme, _equal, _equal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _equal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _equal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _equal.pathData : _equal2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/equal";
  _exports.default = _default;
});