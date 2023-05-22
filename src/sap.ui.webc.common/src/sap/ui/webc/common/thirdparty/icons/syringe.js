sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/syringe", "./v5/syringe"], function (_exports, _Theme, _syringe, _syringe2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _syringe.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _syringe.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _syringe.pathData : _syringe2.pathData;
  _exports.pathData = pathData;
  var _default = "syringe";
  _exports.default = _default;
});