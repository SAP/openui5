sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/operator", "./v2/operator"], function (_exports, _Theme, _operator, _operator2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _operator.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _operator.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _operator.pathData : _operator2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/operator";
  _exports.default = _default;
});