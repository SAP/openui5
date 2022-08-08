sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/bar-code", "./v4/bar-code"], function (_exports, _Theme, _barCode, _barCode2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _barCode.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _barCode.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _barCode.pathData : _barCode2.pathData;
  _exports.pathData = pathData;
  var _default = "bar-code";
  _exports.default = _default;
});