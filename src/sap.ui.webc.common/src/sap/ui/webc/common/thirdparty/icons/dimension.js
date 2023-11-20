sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/dimension", "./v5/dimension"], function (_exports, _Theme, _dimension, _dimension2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dimension.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dimension.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dimension.pathData : _dimension2.pathData;
  _exports.pathData = pathData;
  var _default = "dimension";
  _exports.default = _default;
});