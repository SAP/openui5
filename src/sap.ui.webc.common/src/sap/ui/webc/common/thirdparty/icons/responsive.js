sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/responsive", "./v5/responsive"], function (_exports, _Theme, _responsive, _responsive2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _responsive.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _responsive.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _responsive.pathData : _responsive2.pathData;
  _exports.pathData = pathData;
  var _default = "responsive";
  _exports.default = _default;
});