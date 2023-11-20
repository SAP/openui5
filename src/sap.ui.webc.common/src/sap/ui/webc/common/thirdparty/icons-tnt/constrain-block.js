sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/constrain-block", "./v3/constrain-block"], function (_exports, _Theme, _constrainBlock, _constrainBlock2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _constrainBlock.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _constrainBlock.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _constrainBlock.pathData : _constrainBlock2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/constrain-block";
  _exports.default = _default;
});