sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/composition", "./v3/composition"], function (_exports, _Theme, _composition, _composition2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _composition.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _composition.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _composition.pathData : _composition2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/composition";
  _exports.default = _default;
});