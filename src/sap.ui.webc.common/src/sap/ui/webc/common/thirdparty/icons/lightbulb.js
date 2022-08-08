sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/lightbulb", "./v4/lightbulb"], function (_exports, _Theme, _lightbulb, _lightbulb2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _lightbulb.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _lightbulb.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _lightbulb.pathData : _lightbulb2.pathData;
  _exports.pathData = pathData;
  var _default = "lightbulb";
  _exports.default = _default;
});