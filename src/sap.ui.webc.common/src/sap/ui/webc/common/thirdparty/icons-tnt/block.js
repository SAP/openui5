sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/block", "./v3/block"], function (_exports, _Theme, _block, _block2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _block.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _block.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _block.pathData : _block2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/block";
  _exports.default = _default;
});