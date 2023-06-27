sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/energy-saving-lightbulb", "./v5/energy-saving-lightbulb"], function (_exports, _Theme, _energySavingLightbulb, _energySavingLightbulb2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _energySavingLightbulb.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _energySavingLightbulb.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _energySavingLightbulb.pathData : _energySavingLightbulb2.pathData;
  _exports.pathData = pathData;
  var _default = "energy-saving-lightbulb";
  _exports.default = _default;
});