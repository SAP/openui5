sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/sap-logo-shape", "./v4/sap-logo-shape"], function (_exports, _Theme, _sapLogoShape, _sapLogoShape2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sapLogoShape.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sapLogoShape.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _sapLogoShape.pathData : _sapLogoShape2.pathData;
  _exports.pathData = pathData;
  var _default = "sap-logo-shape";
  _exports.default = _default;
});