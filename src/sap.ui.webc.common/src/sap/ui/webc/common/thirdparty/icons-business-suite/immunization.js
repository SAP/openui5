sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/immunization", "./v2/immunization"], function (_exports, _Theme, _immunization, _immunization2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _immunization.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _immunization.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _immunization.pathData : _immunization2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/immunization";
  _exports.default = _default;
});