sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/simulate", "./v4/simulate"], function (_exports, _Theme, _simulate, _simulate2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _simulate.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _simulate.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _simulate.pathData : _simulate2.pathData;
  _exports.pathData = pathData;
  var _default = "simulate";
  _exports.default = _default;
});