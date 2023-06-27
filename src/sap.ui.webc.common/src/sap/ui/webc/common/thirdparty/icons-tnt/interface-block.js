sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/interface-block", "./v3/interface-block"], function (_exports, _Theme, _interfaceBlock, _interfaceBlock2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _interfaceBlock.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _interfaceBlock.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _interfaceBlock.pathData : _interfaceBlock2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/interface-block";
  _exports.default = _default;
});