sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/refinery", "./v2/refinery"], function (_exports, _Theme, _refinery, _refinery2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _refinery.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _refinery.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _refinery.pathData : _refinery2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/refinery";
  _exports.default = _default;
});